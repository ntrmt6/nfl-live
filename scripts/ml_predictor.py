#!/usr/bin/env python3
"""
NFL Game Outcome Predictor
XGBoost model trained on ESPN historical data (2021-2024).
Saves predictions for all upcoming scheduled games to MongoDB.
"""

import json, time, os, sys
from datetime import datetime
from collections import defaultdict

import requests
import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, confusion_matrix
from pymongo import MongoClient

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)

# ── env loading ──────────────────────────────────────────────────────────────

def load_env():
    env = {}
    for path in [os.path.join(ROOT_DIR, '.env'), os.path.join(ROOT_DIR, '.env.local')]:
        try:
            with open(path) as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        k, _, v = line.partition('=')
                        env[k.strip()] = v.strip().strip('"').strip("'")
        except FileNotFoundError:
            pass
    env.update(os.environ)
    return env

# ── ESPN data ─────────────────────────────────────────────────────────────────

ESPN_REMAP = {'LA': 'LAR', 'WSH': 'WAS'}

def norm(abbr: str) -> str:
    return ESPN_REMAP.get(abbr, abbr)

def fetch_scoreboard(year: int, week: int, season_type: int = 2):
    try:
        r = requests.get(
            'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
            params={'seasontype': season_type, 'week': week, 'dates': year},
            timeout=15,
        )
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"  warn: {year} w{week} st{season_type}: {e}", file=sys.stderr)
        return None

def parse_finished(data, yr: int = 0, wk: int = 0) -> list:
    if not data:
        return []
    out = []
    for ev in data.get('events', []):
        comp = ev.get('competitions', [{}])[0]
        sname = comp.get('status', {}).get('type', {}).get('name', '')
        if sname not in ('STATUS_FINAL', 'STATUS_FINAL_OVERTIME'):
            continue
        home = next((c for c in comp.get('competitors', []) if c.get('homeAway') == 'home'), None)
        away = next((c for c in comp.get('competitors', []) if c.get('homeAway') == 'away'), None)
        if not home or not away:
            continue
        try:
            hs, as_ = int(home.get('score', 0)), int(away.get('score', 0))
        except (ValueError, TypeError):
            continue
        if hs == as_:
            continue
        out.append({
            'date':     comp.get('date', ev.get('date', '')),
            'season':   ev.get('season', {}).get('year', yr),
            'week':     ev.get('week', {}).get('number', wk),
            'homeTeam': norm(home['team']['abbreviation']),
            'awayTeam': norm(away['team']['abbreviation']),
            'homeScore': hs, 'awayScore': as_,
            'homeWin': 1 if hs > as_ else 0,
        })
    return out

def fetch_history(seasons=(2021, 2022, 2023, 2024)) -> pd.DataFrame:
    rows = []
    for yr in seasons:
        print(f"  {yr} regular season...", flush=True)
        for wk in range(1, 19):
            rows.extend(parse_finished(fetch_scoreboard(yr, wk, 2), yr, wk))
            time.sleep(0.1)
        print(f"  {yr} playoffs...", flush=True)
        for wk in range(1, 5):
            rows.extend(parse_finished(fetch_scoreboard(yr, wk, 3), yr, wk))
            time.sleep(0.1)
    df = pd.DataFrame(rows)
    df = df.sort_values('date').reset_index(drop=True)
    print(f"  {len(df)} completed games loaded.", flush=True)
    return df

# ── feature engineering ───────────────────────────────────────────────────────

WINDOW = 6
FEAT_COLS = [
    'h_win_rate', 'h_pts_for', 'h_pts_against', 'h_pt_diff', 'h_n',
    'a_win_rate', 'a_pts_for', 'a_pts_against', 'a_pt_diff', 'a_n',
    'wr_diff', 'pd_diff', 'off_def', 'def_off', 'week',
]

def _stats(hist: list) -> dict:
    if not hist:
        return dict(win_rate=0.5, pts_for=22.0, pts_against=22.0, pt_diff=0.0, n=0)
    n = len(hist)
    return {
        'win_rate':    sum(g['won'] for g in hist) / n,
        'pts_for':     sum(g['pf']  for g in hist) / n,
        'pts_against': sum(g['pa']  for g in hist) / n,
        'pt_diff':     sum(g['pf'] - g['pa'] for g in hist) / n,
        'n': n,
    }

def build_features(df: pd.DataFrame):
    history: dict[str, list] = defaultdict(list)
    rows = []
    for _, g in df.iterrows():
        h, a = g['homeTeam'], g['awayTeam']
        hs = _stats(history[h][-WINDOW:])
        as_ = _stats(history[a][-WINDOW:])
        rows.append({
            'h_win_rate': hs['win_rate'], 'h_pts_for': hs['pts_for'],
            'h_pts_against': hs['pts_against'], 'h_pt_diff': hs['pt_diff'], 'h_n': hs['n'],
            'a_win_rate': as_['win_rate'], 'a_pts_for': as_['pts_for'],
            'a_pts_against': as_['pts_against'], 'a_pt_diff': as_['pt_diff'], 'a_n': as_['n'],
            'wr_diff':  hs['win_rate'] - as_['win_rate'],
            'pd_diff':  hs['pt_diff'] - as_['pt_diff'],
            'off_def':  hs['pts_for'] - as_['pts_against'],
            'def_off':  as_['pts_for'] - hs['pts_against'],
            'week': g['week'],
            'target': g['homeWin'],
        })
        history[h].append({'won': g['homeWin'],     'pf': g['homeScore'], 'pa': g['awayScore']})
        history[a].append({'won': 1 - g['homeWin'], 'pf': g['awayScore'], 'pa': g['homeScore']})
    return pd.DataFrame(rows), history

# ── model ─────────────────────────────────────────────────────────────────────

def train(feat_df: pd.DataFrame):
    X, y = feat_df[FEAT_COLS].values, feat_df['target'].values
    split = int(len(X) * 0.75)
    X_tr, X_te = X[:split], X[split:]
    y_tr, y_te = y[:split], y[split:]

    clf = XGBClassifier(
        n_estimators=300, max_depth=4, learning_rate=0.04,
        subsample=0.8, colsample_bytree=0.8, min_child_weight=3,
        gamma=0.1, random_state=42, eval_metric='logloss', verbosity=0,
    )
    clf.fit(X_tr, y_tr, eval_set=[(X_te, y_te)], verbose=False)
    y_pred = clf.predict(X_te)
    acc = accuracy_score(y_te, y_pred)
    train_acc = accuracy_score(y_tr, clf.predict(X_tr))
    print(f"  Validation accuracy: {acc:.1%}  (n={len(X_te)})", flush=True)

    cm = confusion_matrix(y_te, y_pred)
    conf_matrix = {
        'tn': int(cm[0][0]), 'fp': int(cm[0][1]),
        'fn': int(cm[1][0]), 'tp': int(cm[1][1]),
    }
    importances = clf.feature_importances_
    feature_importances = sorted(
        [{'feature': FEAT_COLS[i], 'importance': round(float(v), 4)}
         for i, v in enumerate(importances)],
        key=lambda x: x['importance'], reverse=True,
    )
    return clf, acc, train_acc, conf_matrix, feature_importances

def predict_matchup(clf, home: str, away: str, week: int, history: dict) -> dict:
    hs  = _stats(history[home][-WINDOW:])
    as_ = _stats(history[away][-WINDOW:])
    X = np.array([[
        hs['win_rate'], hs['pts_for'], hs['pts_against'], hs['pt_diff'], hs['n'],
        as_['win_rate'], as_['pts_for'], as_['pts_against'], as_['pt_diff'], as_['n'],
        hs['win_rate'] - as_['win_rate'],
        hs['pt_diff']  - as_['pt_diff'],
        hs['pts_for']  - as_['pts_against'],
        as_['pts_for'] - hs['pts_against'],
        week,
    ]])
    probs = clf.predict_proba(X)[0]
    hwp = float(probs[1])
    return {
        'homeWinProbability': round(hwp * 100, 1),
        'awayWinProbability': round((1 - hwp) * 100, 1),
        'predictedWinner':    home if hwp >= 0.5 else away,
        'confidence':         round(max(hwp, 1 - hwp) * 100, 1),
        'homeTeamStats': {k: round(v, 2) for k, v in hs.items()},
        'awayTeamStats': {k: round(v, 2) for k, v in as_.items()},
    }

# ── main ──────────────────────────────────────────────────────────────────────

def main():
    env = load_env()
    mongo_uri = env.get('MONGODB_URI', 'mongodb://localhost:27017/nfl-live')

    print('==> Fetching historical NFL data from ESPN (2021-2024)...', flush=True)
    hist_df = fetch_history()

    if len(hist_df) < 100:
        print(f'ERROR: Only {len(hist_df)} games loaded — aborting.', file=sys.stderr)
        sys.exit(1)

    print(f'==> Building features from {len(hist_df)} games...', flush=True)
    feat_df, history = build_features(hist_df)
    feat_df = feat_df[feat_df['h_n'] >= 1].reset_index(drop=True)

    print(f'==> Training XGBoost on {len(feat_df)} samples...', flush=True)
    clf, acc, train_acc, conf_matrix, feature_importances = train(feat_df)

    print('==> Connecting to MongoDB...', flush=True)
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=8000)
    db = client.get_default_database()
    games_col = db['games']
    preds_col = db['predictions']

    upcoming = list(games_col.find({'status': 'scheduled'}).sort('kickoff', 1))
    print(f'==> Found {len(upcoming)} upcoming games. Generating predictions...', flush=True)

    predictions = []
    for game in upcoming:
        home = game.get('homeTeam', '')
        away = game.get('awayTeam', '')
        week = game.get('week', 1)
        if not home or not away:
            continue

        pred = predict_matchup(clf, home, away, week, history)
        doc = {
            'gameId':           game['_id'],
            'slug':             game.get('slug', ''),
            'season':           game.get('season', 2025),
            'week':             week,
            'homeTeam':         home,
            'awayTeam':         away,
            'homeTeamFull':     game.get('homeTeamFull', home),
            'awayTeamFull':     game.get('awayTeamFull', away),
            'kickoff':          game.get('kickoff'),
            'homeWinProbability': pred['homeWinProbability'],
            'awayWinProbability': pred['awayWinProbability'],
            'predictedWinner':  pred['predictedWinner'],
            'confidence':       pred['confidence'],
            'modelAccuracy':    round(acc * 100, 1),
            'homeTeamStats':    pred['homeTeamStats'],
            'awayTeamStats':    pred['awayTeamStats'],
            'generatedAt':      datetime.utcnow(),
        }
        predictions.append(doc)
        winner_label = home if pred['predictedWinner'] == home else away
        print(f"  {away:3s} @ {home:3s}  →  {winner_label} ({pred['confidence']:.0f}% conf)", flush=True)

    for doc in predictions:
        preds_col.update_one({'gameId': doc['gameId']}, {'$set': doc}, upsert=True)

    preds_col.update_one(
        {'_type': 'model_meta'},
        {'$set': {
            '_type': 'model_meta',
            'accuracy': round(acc * 100, 1),
            'trainAccuracy': round(train_acc * 100, 1),
            'trainingSamples': int(len(feat_df)),
            'seasons': [2021, 2022, 2023, 2024],
            'featureImportances': feature_importances,
            'confusionMatrix': conf_matrix,
            'features': FEAT_COLS,
            'updatedAt': datetime.utcnow(),
        }},
        upsert=True,
    )
    client.close()

    summary = {
        'success': True,
        'predictions': len(predictions),
        'modelAccuracy': round(acc * 100, 1),
        'generatedAt': datetime.utcnow().isoformat(),
    }
    print(f'==> Done! {len(predictions)} predictions saved.', flush=True)
    print('SUMMARY:' + json.dumps(summary))

if __name__ == '__main__':
    main()
