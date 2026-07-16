import "dotenv/config";
import mongoose from "mongoose";
import slugify from "slugify";
import Game from "../src/models/Game";

const MONGODB_URI = process.env.MONGODB_URI!;
const AFFILIATE_URL = process.env.DEFAULT_AFFILIATE_URL || "https://example.com/watch";

// 2026 NFL Regular Season — Week 1 kicks off Sep 3, 2026 (Thursday)
// Each week: Thu + Sun 1pm/4pm/SNF + Mon MNF
// Dates: week N starts on day (Sep 3 + (N-1)*7)
function weekDate(week: number, dayOffset: number, hour: number, minute = 0): Date {
  const base = new Date("2026-09-03T00:00:00Z");
  base.setUTCDate(base.getUTCDate() + (week - 1) * 7 + dayOffset);
  base.setUTCHours(hour, minute, 0, 0);
  return base;
}

// dayOffset: 0=Thu, 3=Sun, 4=Mon
const GAMES: Array<{
  week: number;
  dayOffset: number;
  hour: number;
  away: string;
  awayFull: string;
  home: string;
  homeFull: string;
  venue: string;
  network: string;
}> = [
  // WEEK 1
  { week:1, dayOffset:0, hour:20, away:"KC",  awayFull:"Kansas City Chiefs",      home:"BAL", homeFull:"Baltimore Ravens",       venue:"M&T Bank Stadium",          network:"NBC" },
  { week:1, dayOffset:3, hour:13, away:"GB",  awayFull:"Green Bay Packers",        home:"PHI", homeFull:"Philadelphia Eagles",     venue:"Lincoln Financial Field",    network:"FOX" },
  { week:1, dayOffset:3, hour:13, away:"BUF", awayFull:"Buffalo Bills",            home:"NYJ", homeFull:"New York Jets",           venue:"MetLife Stadium",            network:"CBS" },
  { week:1, dayOffset:3, hour:13, away:"PIT", awayFull:"Pittsburgh Steelers",      home:"ATL", homeFull:"Atlanta Falcons",         venue:"Mercedes-Benz Stadium",      network:"CBS" },
  { week:1, dayOffset:3, hour:13, away:"IND", awayFull:"Indianapolis Colts",       home:"HOU", homeFull:"Houston Texans",          venue:"NRG Stadium",                network:"CBS" },
  { week:1, dayOffset:3, hour:13, away:"JAX", awayFull:"Jacksonville Jaguars",     home:"TEN", homeFull:"Tennessee Titans",        venue:"Nissan Stadium",             network:"CBS" },
  { week:1, dayOffset:3, hour:13, away:"NE",  awayFull:"New England Patriots",     home:"MIA", homeFull:"Miami Dolphins",          venue:"Hard Rock Stadium",          network:"CBS" },
  { week:1, dayOffset:3, hour:13, away:"WAS", awayFull:"Washington Commanders",    home:"TB",  homeFull:"Tampa Bay Buccaneers",    venue:"Raymond James Stadium",      network:"FOX" },
  { week:1, dayOffset:3, hour:13, away:"NO",  awayFull:"New Orleans Saints",       home:"CAR", homeFull:"Carolina Panthers",       venue:"Bank of America Stadium",    network:"FOX" },
  { week:1, dayOffset:3, hour:16, away:"SF",  awayFull:"San Francisco 49ers",      home:"DAL", homeFull:"Dallas Cowboys",          venue:"AT&T Stadium",               network:"FOX" },
  { week:1, dayOffset:3, hour:16, away:"DET", awayFull:"Detroit Lions",            home:"LAR", homeFull:"Los Angeles Rams",        venue:"SoFi Stadium",               network:"CBS" },
  { week:1, dayOffset:3, hour:16, away:"CIN", awayFull:"Cincinnati Bengals",       home:"DEN", homeFull:"Denver Broncos",          venue:"Empower Field",              network:"CBS" },
  { week:1, dayOffset:3, hour:16, away:"CHI", awayFull:"Chicago Bears",            home:"MIN", homeFull:"Minnesota Vikings",       venue:"U.S. Bank Stadium",          network:"FOX" },
  { week:1, dayOffset:3, hour:16, away:"CLE", awayFull:"Cleveland Browns",         home:"LV",  homeFull:"Las Vegas Raiders",       venue:"Allegiant Stadium",          network:"CBS" },
  { week:1, dayOffset:3, hour:16, away:"ARI", awayFull:"Arizona Cardinals",        home:"SEA", homeFull:"Seattle Seahawks",        venue:"Lumen Field",                network:"FOX" },
  { week:1, dayOffset:3, hour:20, away:"LAC", awayFull:"Los Angeles Chargers",     home:"LV",  homeFull:"Las Vegas Raiders",       venue:"Allegiant Stadium",          network:"NBC" },
  { week:1, dayOffset:4, hour:20, away:"NYG", awayFull:"New York Giants",          home:"DAL", homeFull:"Dallas Cowboys",          venue:"AT&T Stadium",               network:"ABC/ESPN" },

  // WEEK 2
  { week:2, dayOffset:0, hour:20, away:"PHI", awayFull:"Philadelphia Eagles",      home:"GB",  homeFull:"Green Bay Packers",       venue:"Lambeau Field",              network:"NBC" },
  { week:2, dayOffset:3, hour:13, away:"BAL", awayFull:"Baltimore Ravens",          home:"BUF", homeFull:"Buffalo Bills",           venue:"Highmark Stadium",           network:"CBS" },
  { week:2, dayOffset:3, hour:13, away:"MIA", awayFull:"Miami Dolphins",            home:"NE",  homeFull:"New England Patriots",    venue:"Gillette Stadium",           network:"CBS" },
  { week:2, dayOffset:3, hour:13, away:"HOU", awayFull:"Houston Texans",            home:"IND", homeFull:"Indianapolis Colts",      venue:"Lucas Oil Stadium",          network:"CBS" },
  { week:2, dayOffset:3, hour:13, away:"TEN", awayFull:"Tennessee Titans",          home:"JAX", homeFull:"Jacksonville Jaguars",    venue:"EverBank Stadium",           network:"CBS" },
  { week:2, dayOffset:3, hour:13, away:"ATL", awayFull:"Atlanta Falcons",           home:"NO",  homeFull:"New Orleans Saints",      venue:"Caesars Superdome",          network:"FOX" },
  { week:2, dayOffset:3, hour:13, away:"CAR", awayFull:"Carolina Panthers",         home:"WAS", homeFull:"Washington Commanders",   venue:"Northwest Stadium",          network:"FOX" },
  { week:2, dayOffset:3, hour:13, away:"TB",  awayFull:"Tampa Bay Buccaneers",      home:"NYG", homeFull:"New York Giants",         venue:"MetLife Stadium",            network:"FOX" },
  { week:2, dayOffset:3, hour:16, away:"DAL", awayFull:"Dallas Cowboys",            home:"SF",  homeFull:"San Francisco 49ers",     venue:"Levi's Stadium",             network:"FOX" },
  { week:2, dayOffset:3, hour:16, away:"MIN", awayFull:"Minnesota Vikings",         home:"DET", homeFull:"Detroit Lions",           venue:"Ford Field",                 network:"FOX" },
  { week:2, dayOffset:3, hour:16, away:"SEA", awayFull:"Seattle Seahawks",          home:"ARI", homeFull:"Arizona Cardinals",       venue:"State Farm Stadium",         network:"FOX" },
  { week:2, dayOffset:3, hour:16, away:"DEN", awayFull:"Denver Broncos",            home:"LAC", homeFull:"Los Angeles Chargers",    venue:"SoFi Stadium",               network:"CBS" },
  { week:2, dayOffset:3, hour:16, away:"LV",  awayFull:"Las Vegas Raiders",         home:"CLE", homeFull:"Cleveland Browns",        venue:"Huntington Bank Field",      network:"CBS" },
  { week:2, dayOffset:3, hour:20, away:"KC",  awayFull:"Kansas City Chiefs",        home:"CIN", homeFull:"Cincinnati Bengals",      venue:"Paycor Stadium",             network:"NBC" },
  { week:2, dayOffset:4, hour:20, away:"NYJ", awayFull:"New York Jets",             home:"PIT", homeFull:"Pittsburgh Steelers",     venue:"Acrisure Stadium",           network:"ABC/ESPN" },

  // WEEK 3
  { week:3, dayOffset:0, hour:20, away:"DAL", awayFull:"Dallas Cowboys",            home:"NYG", homeFull:"New York Giants",         venue:"MetLife Stadium",            network:"NBC" },
  { week:3, dayOffset:3, hour:13, away:"BUF", awayFull:"Buffalo Bills",             home:"MIA", homeFull:"Miami Dolphins",          venue:"Hard Rock Stadium",          network:"CBS" },
  { week:3, dayOffset:3, hour:13, away:"KC",  awayFull:"Kansas City Chiefs",        home:"HOU", homeFull:"Houston Texans",          venue:"NRG Stadium",                network:"CBS" },
  { week:3, dayOffset:3, hour:13, away:"PIT", awayFull:"Pittsburgh Steelers",       home:"CLE", homeFull:"Cleveland Browns",        venue:"Huntington Bank Field",      network:"CBS" },
  { week:3, dayOffset:3, hour:13, away:"IND", awayFull:"Indianapolis Colts",        home:"TEN", homeFull:"Tennessee Titans",        venue:"Nissan Stadium",             network:"CBS" },
  { week:3, dayOffset:3, hour:13, away:"NE",  awayFull:"New England Patriots",      home:"NYJ", homeFull:"New York Jets",           venue:"MetLife Stadium",            network:"CBS" },
  { week:3, dayOffset:3, hour:13, away:"GB",  awayFull:"Green Bay Packers",         home:"MIN", homeFull:"Minnesota Vikings",       venue:"U.S. Bank Stadium",          network:"FOX" },
  { week:3, dayOffset:3, hour:13, away:"ATL", awayFull:"Atlanta Falcons",           home:"CAR", homeFull:"Carolina Panthers",       venue:"Bank of America Stadium",    network:"FOX" },
  { week:3, dayOffset:3, hour:13, away:"WAS", awayFull:"Washington Commanders",     home:"NO",  homeFull:"New Orleans Saints",      venue:"Caesars Superdome",          network:"FOX" },
  { week:3, dayOffset:3, hour:16, away:"SF",  awayFull:"San Francisco 49ers",       home:"LAR", homeFull:"Los Angeles Rams",        venue:"SoFi Stadium",               network:"FOX" },
  { week:3, dayOffset:3, hour:16, away:"SEA", awayFull:"Seattle Seahawks",          home:"DEN", homeFull:"Denver Broncos",          venue:"Empower Field",              network:"CBS" },
  { week:3, dayOffset:3, hour:16, away:"LV",  awayFull:"Las Vegas Raiders",         home:"LAC", homeFull:"Los Angeles Chargers",    venue:"SoFi Stadium",               network:"CBS" },
  { week:3, dayOffset:3, hour:16, away:"ARI", awayFull:"Arizona Cardinals",         home:"CHI", homeFull:"Chicago Bears",           venue:"Soldier Field",              network:"FOX" },
  { week:3, dayOffset:3, hour:20, away:"PHI", awayFull:"Philadelphia Eagles",       home:"TB",  homeFull:"Tampa Bay Buccaneers",    venue:"Raymond James Stadium",      network:"NBC" },
  { week:3, dayOffset:4, hour:20, away:"DET", awayFull:"Detroit Lions",             home:"CIN", homeFull:"Cincinnati Bengals",      venue:"Paycor Stadium",             network:"ABC/ESPN" },

  // WEEK 4
  { week:4, dayOffset:0, hour:20, away:"GB",  awayFull:"Green Bay Packers",         home:"CHI", homeFull:"Chicago Bears",           venue:"Soldier Field",              network:"NBC" },
  { week:4, dayOffset:3, hour:13, away:"BAL", awayFull:"Baltimore Ravens",          home:"PIT", homeFull:"Pittsburgh Steelers",     venue:"Acrisure Stadium",           network:"CBS" },
  { week:4, dayOffset:3, hour:13, away:"HOU", awayFull:"Houston Texans",            home:"JAX", homeFull:"Jacksonville Jaguars",    venue:"EverBank Stadium",           network:"CBS" },
  { week:4, dayOffset:3, hour:13, away:"CLE", awayFull:"Cleveland Browns",          home:"IND", homeFull:"Indianapolis Colts",      venue:"Lucas Oil Stadium",          network:"CBS" },
  { week:4, dayOffset:3, hour:13, away:"MIA", awayFull:"Miami Dolphins",            home:"TEN", homeFull:"Tennessee Titans",        venue:"Nissan Stadium",             network:"CBS" },
  { week:4, dayOffset:3, hour:13, away:"NO",  awayFull:"New Orleans Saints",        home:"ATL", homeFull:"Atlanta Falcons",         venue:"Mercedes-Benz Stadium",      network:"FOX" },
  { week:4, dayOffset:3, hour:13, away:"NYG", awayFull:"New York Giants",           home:"WAS", homeFull:"Washington Commanders",   venue:"Northwest Stadium",          network:"FOX" },
  { week:4, dayOffset:3, hour:13, away:"CAR", awayFull:"Carolina Panthers",         home:"TB",  homeFull:"Tampa Bay Buccaneers",    venue:"Raymond James Stadium",      network:"FOX" },
  { week:4, dayOffset:3, hour:16, away:"KC",  awayFull:"Kansas City Chiefs",        home:"LAC", homeFull:"Los Angeles Chargers",    venue:"SoFi Stadium",               network:"CBS" },
  { week:4, dayOffset:3, hour:16, away:"DEN", awayFull:"Denver Broncos",            home:"LV",  homeFull:"Las Vegas Raiders",       venue:"Allegiant Stadium",          network:"CBS" },
  { week:4, dayOffset:3, hour:16, away:"MIN", awayFull:"Minnesota Vikings",         home:"SF",  homeFull:"San Francisco 49ers",     venue:"Levi's Stadium",             network:"FOX" },
  { week:4, dayOffset:3, hour:16, away:"LAR", awayFull:"Los Angeles Rams",          home:"SEA", homeFull:"Seattle Seahawks",        venue:"Lumen Field",                network:"FOX" },
  { week:4, dayOffset:3, hour:20, away:"BUF", awayFull:"Buffalo Bills",             home:"KC",  homeFull:"Kansas City Chiefs",      venue:"GEHA Field at Arrowhead",    network:"NBC" },
  { week:4, dayOffset:4, hour:20, away:"PHI", awayFull:"Philadelphia Eagles",       home:"DAL", homeFull:"Dallas Cowboys",          venue:"AT&T Stadium",               network:"ABC/ESPN" },

  // WEEK 5
  { week:5, dayOffset:0, hour:20, away:"BAL", awayFull:"Baltimore Ravens",          home:"BUF", homeFull:"Buffalo Bills",           venue:"Highmark Stadium",           network:"NBC" },
  { week:5, dayOffset:3, hour:13, away:"TEN", awayFull:"Tennessee Titans",          home:"IND", homeFull:"Indianapolis Colts",      venue:"Lucas Oil Stadium",          network:"CBS" },
  { week:5, dayOffset:3, hour:13, away:"JAX", awayFull:"Jacksonville Jaguars",      home:"HOU", homeFull:"Houston Texans",          venue:"NRG Stadium",                network:"CBS" },
  { week:5, dayOffset:3, hour:13, away:"NYJ", awayFull:"New York Jets",             home:"MIA", homeFull:"Miami Dolphins",          venue:"Hard Rock Stadium",          network:"CBS" },
  { week:5, dayOffset:3, hour:13, away:"PIT", awayFull:"Pittsburgh Steelers",       home:"NE",  homeFull:"New England Patriots",    venue:"Gillette Stadium",           network:"CBS" },
  { week:5, dayOffset:3, hour:13, away:"TB",  awayFull:"Tampa Bay Buccaneers",      home:"NO",  homeFull:"New Orleans Saints",      venue:"Caesars Superdome",          network:"FOX" },
  { week:5, dayOffset:3, hour:13, away:"WAS", awayFull:"Washington Commanders",     home:"NYG", homeFull:"New York Giants",         venue:"MetLife Stadium",            network:"FOX" },
  { week:5, dayOffset:3, hour:16, away:"DAL", awayFull:"Dallas Cowboys",            home:"SF",  homeFull:"San Francisco 49ers",     venue:"Levi's Stadium",             network:"FOX" },
  { week:5, dayOffset:3, hour:16, away:"DET", awayFull:"Detroit Lions",             home:"GB",  homeFull:"Green Bay Packers",       venue:"Lambeau Field",              network:"FOX" },
  { week:5, dayOffset:3, hour:16, away:"LAC", awayFull:"Los Angeles Chargers",      home:"DEN", homeFull:"Denver Broncos",          venue:"Empower Field",              network:"CBS" },
  { week:5, dayOffset:3, hour:16, away:"SEA", awayFull:"Seattle Seahawks",          home:"LAR", homeFull:"Los Angeles Rams",        venue:"SoFi Stadium",               network:"FOX" },
  { week:5, dayOffset:3, hour:20, away:"KC",  awayFull:"Kansas City Chiefs",        home:"MIN", homeFull:"Minnesota Vikings",       venue:"U.S. Bank Stadium",          network:"NBC" },
  { week:5, dayOffset:4, hour:20, away:"CIN", awayFull:"Cincinnati Bengals",        home:"BAL", homeFull:"Baltimore Ravens",        venue:"M&T Bank Stadium",           network:"ABC/ESPN" },

  // WEEK 6
  { week:6, dayOffset:0, hour:20, away:"KC",  awayFull:"Kansas City Chiefs",        home:"SF",  homeFull:"San Francisco 49ers",     venue:"Levi's Stadium",             network:"NBC" },
  { week:6, dayOffset:3, hour:13, away:"BUF", awayFull:"Buffalo Bills",             home:"NE",  homeFull:"New England Patriots",    venue:"Gillette Stadium",           network:"CBS" },
  { week:6, dayOffset:3, hour:13, away:"HOU", awayFull:"Houston Texans",            home:"CLE", homeFull:"Cleveland Browns",        venue:"Huntington Bank Field",      network:"CBS" },
  { week:6, dayOffset:3, hour:13, away:"IND", awayFull:"Indianapolis Colts",        home:"JAX", homeFull:"Jacksonville Jaguars",    venue:"EverBank Stadium",           network:"CBS" },
  { week:6, dayOffset:3, hour:13, away:"MIA", awayFull:"Miami Dolphins",            home:"PIT", homeFull:"Pittsburgh Steelers",     venue:"Acrisure Stadium",           network:"CBS" },
  { week:6, dayOffset:3, hour:13, away:"CAR", awayFull:"Carolina Panthers",         home:"WAS", homeFull:"Washington Commanders",   venue:"Northwest Stadium",          network:"FOX" },
  { week:6, dayOffset:3, hour:13, away:"NYG", awayFull:"New York Giants",           home:"ATL", homeFull:"Atlanta Falcons",         venue:"Mercedes-Benz Stadium",      network:"FOX" },
  { week:6, dayOffset:3, hour:13, away:"NO",  awayFull:"New Orleans Saints",        home:"TB",  homeFull:"Tampa Bay Buccaneers",    venue:"Raymond James Stadium",      network:"FOX" },
  { week:6, dayOffset:3, hour:16, away:"PHI", awayFull:"Philadelphia Eagles",       home:"MIN", homeFull:"Minnesota Vikings",       venue:"U.S. Bank Stadium",          network:"FOX" },
  { week:6, dayOffset:3, hour:16, away:"CHI", awayFull:"Chicago Bears",             home:"DET", homeFull:"Detroit Lions",           venue:"Ford Field",                 network:"FOX" },
  { week:6, dayOffset:3, hour:16, away:"LAR", awayFull:"Los Angeles Rams",          home:"ARI", homeFull:"Arizona Cardinals",       venue:"State Farm Stadium",         network:"FOX" },
  { week:6, dayOffset:3, hour:16, away:"LV",  awayFull:"Las Vegas Raiders",         home:"DEN", homeFull:"Denver Broncos",          venue:"Empower Field",              network:"CBS" },
  { week:6, dayOffset:4, hour:20, away:"DAL", awayFull:"Dallas Cowboys",            home:"GB",  homeFull:"Green Bay Packers",       venue:"Lambeau Field",              network:"ABC/ESPN" },

  // WEEK 7
  { week:7, dayOffset:0, hour:20, away:"PHI", awayFull:"Philadelphia Eagles",       home:"NYG", homeFull:"New York Giants",         venue:"MetLife Stadium",            network:"NBC" },
  { week:7, dayOffset:3, hour:13, away:"BAL", awayFull:"Baltimore Ravens",          home:"CLE", homeFull:"Cleveland Browns",        venue:"Huntington Bank Field",      network:"CBS" },
  { week:7, dayOffset:3, hour:13, away:"TEN", awayFull:"Tennessee Titans",          home:"HOU", homeFull:"Houston Texans",          venue:"NRG Stadium",                network:"CBS" },
  { week:7, dayOffset:3, hour:13, away:"NE",  awayFull:"New England Patriots",      home:"BUF", homeFull:"Buffalo Bills",           venue:"Highmark Stadium",           network:"CBS" },
  { week:7, dayOffset:3, hour:13, away:"NYJ", awayFull:"New York Jets",             home:"IND", homeFull:"Indianapolis Colts",      venue:"Lucas Oil Stadium",          network:"CBS" },
  { week:7, dayOffset:3, hour:13, away:"ATL", awayFull:"Atlanta Falcons",           home:"CAR", homeFull:"Carolina Panthers",       venue:"Bank of America Stadium",    network:"FOX" },
  { week:7, dayOffset:3, hour:13, away:"WAS", awayFull:"Washington Commanders",     home:"TB",  homeFull:"Tampa Bay Buccaneers",    venue:"Raymond James Stadium",      network:"FOX" },
  { week:7, dayOffset:3, hour:16, away:"KC",  awayFull:"Kansas City Chiefs",        home:"LAR", homeFull:"Los Angeles Rams",        venue:"SoFi Stadium",               network:"FOX" },
  { week:7, dayOffset:3, hour:16, away:"GB",  awayFull:"Green Bay Packers",         home:"DET", homeFull:"Detroit Lions",           venue:"Ford Field",                 network:"FOX" },
  { week:7, dayOffset:3, hour:16, away:"DEN", awayFull:"Denver Broncos",            home:"SEA", homeFull:"Seattle Seahawks",        venue:"Lumen Field",                network:"CBS" },
  { week:7, dayOffset:3, hour:16, away:"LAC", awayFull:"Los Angeles Chargers",      home:"LV",  homeFull:"Las Vegas Raiders",       venue:"Allegiant Stadium",          network:"CBS" },
  { week:7, dayOffset:3, hour:20, away:"SF",  awayFull:"San Francisco 49ers",       home:"DAL", homeFull:"Dallas Cowboys",          venue:"AT&T Stadium",               network:"NBC" },
  { week:7, dayOffset:4, hour:20, away:"CIN", awayFull:"Cincinnati Bengals",        home:"PIT", homeFull:"Pittsburgh Steelers",     venue:"Acrisure Stadium",           network:"ABC/ESPN" },

  // WEEK 8
  { week:8, dayOffset:0, hour:20, away:"MIN", awayFull:"Minnesota Vikings",         home:"GB",  homeFull:"Green Bay Packers",       venue:"Lambeau Field",              network:"NBC" },
  { week:8, dayOffset:3, hour:13, away:"BUF", awayFull:"Buffalo Bills",             home:"NYJ", homeFull:"New York Jets",           venue:"MetLife Stadium",            network:"CBS" },
  { week:8, dayOffset:3, hour:13, away:"PIT", awayFull:"Pittsburgh Steelers",       home:"BAL", homeFull:"Baltimore Ravens",        venue:"M&T Bank Stadium",           network:"CBS" },
  { week:8, dayOffset:3, hour:13, away:"JAX", awayFull:"Jacksonville Jaguars",      home:"IND", homeFull:"Indianapolis Colts",      venue:"Lucas Oil Stadium",          network:"CBS" },
  { week:8, dayOffset:3, hour:13, away:"CLE", awayFull:"Cleveland Browns",          home:"TEN", homeFull:"Tennessee Titans",        venue:"Nissan Stadium",             network:"CBS" },
  { week:8, dayOffset:3, hour:13, away:"ATL", awayFull:"Atlanta Falcons",           home:"TB",  homeFull:"Tampa Bay Buccaneers",    venue:"Raymond James Stadium",      network:"FOX" },
  { week:8, dayOffset:3, hour:13, away:"NO",  awayFull:"New Orleans Saints",        home:"CAR", homeFull:"Carolina Panthers",       venue:"Bank of America Stadium",    network:"FOX" },
  { week:8, dayOffset:3, hour:13, away:"NYG", awayFull:"New York Giants",           home:"PHI", homeFull:"Philadelphia Eagles",     venue:"Lincoln Financial Field",    network:"FOX" },
  { week:8, dayOffset:3, hour:16, away:"SF",  awayFull:"San Francisco 49ers",       home:"SEA", homeFull:"Seattle Seahawks",        venue:"Lumen Field",                network:"FOX" },
  { week:8, dayOffset:3, hour:16, away:"ARI", awayFull:"Arizona Cardinals",         home:"LAR", homeFull:"Los Angeles Rams",        venue:"SoFi Stadium",               network:"FOX" },
  { week:8, dayOffset:3, hour:16, away:"LV",  awayFull:"Las Vegas Raiders",         home:"KC",  homeFull:"Kansas City Chiefs",      venue:"GEHA Field at Arrowhead",    network:"CBS" },
  { week:8, dayOffset:3, hour:16, away:"DEN", awayFull:"Denver Broncos",            home:"LAC", homeFull:"Los Angeles Chargers",    venue:"SoFi Stadium",               network:"CBS" },
  { week:8, dayOffset:4, hour:20, away:"DAL", awayFull:"Dallas Cowboys",            home:"WAS", homeFull:"Washington Commanders",   venue:"Northwest Stadium",          network:"ABC/ESPN" },

  // WEEK 9
  { week:9, dayOffset:0, hour:20, away:"KC",  awayFull:"Kansas City Chiefs",        home:"BUF", homeFull:"Buffalo Bills",           venue:"Highmark Stadium",           network:"NBC" },
  { week:9, dayOffset:3, hour:13, away:"MIA", awayFull:"Miami Dolphins",            home:"NYJ", homeFull:"New York Jets",           venue:"MetLife Stadium",            network:"CBS" },
  { week:9, dayOffset:3, hour:13, away:"NE",  awayFull:"New England Patriots",      home:"PIT", homeFull:"Pittsburgh Steelers",     venue:"Acrisure Stadium",           network:"CBS" },
  { week:9, dayOffset:3, hour:13, away:"HOU", awayFull:"Houston Texans",            home:"TEN", homeFull:"Tennessee Titans",        venue:"Nissan Stadium",             network:"CBS" },
  { week:9, dayOffset:3, hour:13, away:"IND", awayFull:"Indianapolis Colts",        home:"CLE", homeFull:"Cleveland Browns",        venue:"Huntington Bank Field",      network:"CBS" },
  { week:9, dayOffset:3, hour:13, away:"TB",  awayFull:"Tampa Bay Buccaneers",      home:"ATL", homeFull:"Atlanta Falcons",         venue:"Mercedes-Benz Stadium",      network:"FOX" },
  { week:9, dayOffset:3, hour:13, away:"NO",  awayFull:"New Orleans Saints",        home:"WAS", homeFull:"Washington Commanders",   venue:"Northwest Stadium",          network:"FOX" },
  { week:9, dayOffset:3, hour:13, away:"CAR", awayFull:"Carolina Panthers",         home:"NYG", homeFull:"New York Giants",         venue:"MetLife Stadium",            network:"FOX" },
  { week:9, dayOffset:3, hour:16, away:"DET", awayFull:"Detroit Lions",             home:"MIN", homeFull:"Minnesota Vikings",       venue:"U.S. Bank Stadium",          network:"FOX" },
  { week:9, dayOffset:3, hour:16, away:"CHI", awayFull:"Chicago Bears",             home:"GB",  homeFull:"Green Bay Packers",       venue:"Lambeau Field",              network:"FOX" },
  { week:9, dayOffset:3, hour:16, away:"LAC", awayFull:"Los Angeles Chargers",      home:"KC",  homeFull:"Kansas City Chiefs",      venue:"GEHA Field at Arrowhead",    network:"CBS" },
  { week:9, dayOffset:3, hour:16, away:"SEA", awayFull:"Seattle Seahawks",          home:"SF",  homeFull:"San Francisco 49ers",     venue:"Levi's Stadium",             network:"FOX" },
  { week:9, dayOffset:3, hour:20, away:"PHI", awayFull:"Philadelphia Eagles",       home:"DAL", homeFull:"Dallas Cowboys",          venue:"AT&T Stadium",               network:"NBC" },
  { week:9, dayOffset:4, hour:20, away:"CIN", awayFull:"Cincinnati Bengals",        home:"CLE", homeFull:"Cleveland Browns",        venue:"Huntington Bank Field",      network:"ABC/ESPN" },

  // WEEK 10
  { week:10, dayOffset:0, hour:20, away:"SF",  awayFull:"San Francisco 49ers",      home:"GB",  homeFull:"Green Bay Packers",       venue:"Lambeau Field",              network:"NBC" },
  { week:10, dayOffset:3, hour:13, away:"BAL", awayFull:"Baltimore Ravens",         home:"MIA", homeFull:"Miami Dolphins",          venue:"Hard Rock Stadium",          network:"CBS" },
  { week:10, dayOffset:3, hour:13, away:"BUF", awayFull:"Buffalo Bills",            home:"IND", homeFull:"Indianapolis Colts",      venue:"Lucas Oil Stadium",          network:"CBS" },
  { week:10, dayOffset:3, hour:13, away:"JAX", awayFull:"Jacksonville Jaguars",     home:"HOU", homeFull:"Houston Texans",          venue:"NRG Stadium",                network:"CBS" },
  { week:10, dayOffset:3, hour:13, away:"TEN", awayFull:"Tennessee Titans",         home:"NE",  homeFull:"New England Patriots",    venue:"Gillette Stadium",           network:"CBS" },
  { week:10, dayOffset:3, hour:13, away:"ATL", awayFull:"Atlanta Falcons",          home:"WAS", homeFull:"Washington Commanders",   venue:"Northwest Stadium",          network:"FOX" },
  { week:10, dayOffset:3, hour:13, away:"CAR", awayFull:"Carolina Panthers",        home:"NO",  homeFull:"New Orleans Saints",      venue:"Caesars Superdome",          network:"FOX" },
  { week:10, dayOffset:3, hour:13, away:"TB",  awayFull:"Tampa Bay Buccaneers",     home:"NYG", homeFull:"New York Giants",         venue:"MetLife Stadium",            network:"FOX" },
  { week:10, dayOffset:3, hour:16, away:"DAL", awayFull:"Dallas Cowboys",           home:"PHI", homeFull:"Philadelphia Eagles",     venue:"Lincoln Financial Field",    network:"FOX" },
  { week:10, dayOffset:3, hour:16, away:"MIN", awayFull:"Minnesota Vikings",        home:"CHI", homeFull:"Chicago Bears",           venue:"Soldier Field",              network:"FOX" },
  { week:10, dayOffset:3, hour:16, away:"KC",  awayFull:"Kansas City Chiefs",       home:"DEN", homeFull:"Denver Broncos",          venue:"Empower Field",              network:"CBS" },
  { week:10, dayOffset:3, hour:16, away:"LAR", awayFull:"Los Angeles Rams",         home:"LAC", homeFull:"Los Angeles Chargers",    venue:"SoFi Stadium",               network:"CBS" },
  { week:10, dayOffset:3, hour:16, away:"ARI", awayFull:"Arizona Cardinals",        home:"SEA", homeFull:"Seattle Seahawks",        venue:"Lumen Field",                network:"FOX" },
  { week:10, dayOffset:4, hour:20, away:"PIT", awayFull:"Pittsburgh Steelers",      home:"BAL", homeFull:"Baltimore Ravens",        venue:"M&T Bank Stadium",           network:"ABC/ESPN" },

  // WEEK 11
  { week:11, dayOffset:0, hour:20, away:"DAL", awayFull:"Dallas Cowboys",           home:"PHI", homeFull:"Philadelphia Eagles",     venue:"Lincoln Financial Field",    network:"NBC" },
  { week:11, dayOffset:3, hour:13, away:"MIA", awayFull:"Miami Dolphins",           home:"BUF", homeFull:"Buffalo Bills",           venue:"Highmark Stadium",           network:"CBS" },
  { week:11, dayOffset:3, hour:13, away:"IND", awayFull:"Indianapolis Colts",       home:"HOU", homeFull:"Houston Texans",          venue:"NRG Stadium",                network:"CBS" },
  { week:11, dayOffset:3, hour:13, away:"CLE", awayFull:"Cleveland Browns",         home:"PIT", homeFull:"Pittsburgh Steelers",     venue:"Acrisure Stadium",           network:"CBS" },
  { week:11, dayOffset:3, hour:13, away:"JAX", awayFull:"Jacksonville Jaguars",     home:"TEN", homeFull:"Tennessee Titans",        venue:"Nissan Stadium",             network:"CBS" },
  { week:11, dayOffset:3, hour:13, away:"WAS", awayFull:"Washington Commanders",    home:"ATL", homeFull:"Atlanta Falcons",         venue:"Mercedes-Benz Stadium",      network:"FOX" },
  { week:11, dayOffset:3, hour:13, away:"NYG", awayFull:"New York Giants",          home:"CAR", homeFull:"Carolina Panthers",       venue:"Bank of America Stadium",    network:"FOX" },
  { week:11, dayOffset:3, hour:13, away:"NO",  awayFull:"New Orleans Saints",       home:"TB",  homeFull:"Tampa Bay Buccaneers",    venue:"Raymond James Stadium",      network:"FOX" },
  { week:11, dayOffset:3, hour:16, away:"GB",  awayFull:"Green Bay Packers",        home:"CHI", homeFull:"Chicago Bears",           venue:"Soldier Field",              network:"FOX" },
  { week:11, dayOffset:3, hour:16, away:"DET", awayFull:"Detroit Lions",            home:"MIN", homeFull:"Minnesota Vikings",       venue:"U.S. Bank Stadium",          network:"FOX" },
  { week:11, dayOffset:3, hour:16, away:"LV",  awayFull:"Las Vegas Raiders",        home:"LAC", homeFull:"Los Angeles Chargers",    venue:"SoFi Stadium",               network:"CBS" },
  { week:11, dayOffset:3, hour:16, away:"SEA", awayFull:"Seattle Seahawks",         home:"ARI", homeFull:"Arizona Cardinals",       venue:"State Farm Stadium",         network:"FOX" },
  { week:11, dayOffset:3, hour:20, away:"KC",  awayFull:"Kansas City Chiefs",       home:"CIN", homeFull:"Cincinnati Bengals",      venue:"Paycor Stadium",             network:"NBC" },
  { week:11, dayOffset:4, hour:20, away:"SF",  awayFull:"San Francisco 49ers",      home:"LAR", homeFull:"Los Angeles Rams",        venue:"SoFi Stadium",               network:"ABC/ESPN" },

  // WEEK 12 — Thanksgiving
  { week:12, dayOffset:3, hour:12, away:"KC",  awayFull:"Kansas City Chiefs",       home:"DAL", homeFull:"Dallas Cowboys",          venue:"AT&T Stadium",               network:"CBS" },
  { week:12, dayOffset:3, hour:16, away:"NYG", awayFull:"New York Giants",          home:"DET", homeFull:"Detroit Lions",           venue:"Ford Field",                 network:"FOX" },
  { week:12, dayOffset:3, hour:20, away:"GB",  awayFull:"Green Bay Packers",        home:"MIA", homeFull:"Miami Dolphins",          venue:"Hard Rock Stadium",          network:"NBC" },
  { week:12, dayOffset:5, hour:15, away:"PHI", awayFull:"Philadelphia Eagles",      home:"BAL", homeFull:"Baltimore Ravens",        venue:"M&T Bank Stadium",           network:"Prime" },
  { week:12, dayOffset:6, hour:13, away:"BUF", awayFull:"Buffalo Bills",            home:"PIT", homeFull:"Pittsburgh Steelers",     venue:"Acrisure Stadium",           network:"CBS" },
  { week:12, dayOffset:6, hour:16, away:"SF",  awayFull:"San Francisco 49ers",      home:"SEA", homeFull:"Seattle Seahawks",        venue:"Lumen Field",                network:"FOX" },
  { week:12, dayOffset:6, hour:20, away:"CIN", awayFull:"Cincinnati Bengals",       home:"MIN", homeFull:"Minnesota Vikings",       venue:"U.S. Bank Stadium",          network:"NBC" },

  // WEEK 13
  { week:13, dayOffset:0, hour:20, away:"BAL", awayFull:"Baltimore Ravens",         home:"KC",  homeFull:"Kansas City Chiefs",      venue:"GEHA Field at Arrowhead",    network:"NBC" },
  { week:13, dayOffset:3, hour:13, away:"MIA", awayFull:"Miami Dolphins",           home:"NYJ", homeFull:"New York Jets",           venue:"MetLife Stadium",            network:"CBS" },
  { week:13, dayOffset:3, hour:13, away:"IND", awayFull:"Indianapolis Colts",       home:"TEN", homeFull:"Tennessee Titans",        venue:"Nissan Stadium",             network:"CBS" },
  { week:13, dayOffset:3, hour:13, away:"NE",  awayFull:"New England Patriots",     home:"CLE", homeFull:"Cleveland Browns",        venue:"Huntington Bank Field",      network:"CBS" },
  { week:13, dayOffset:3, hour:13, away:"HOU", awayFull:"Houston Texans",           home:"JAX", homeFull:"Jacksonville Jaguars",    venue:"EverBank Stadium",           network:"CBS" },
  { week:13, dayOffset:3, hour:13, away:"TB",  awayFull:"Tampa Bay Buccaneers",     home:"WAS", homeFull:"Washington Commanders",   venue:"Northwest Stadium",          network:"FOX" },
  { week:13, dayOffset:3, hour:13, away:"ATL", awayFull:"Atlanta Falcons",          home:"NO",  homeFull:"New Orleans Saints",      venue:"Caesars Superdome",          network:"FOX" },
  { week:13, dayOffset:3, hour:13, away:"CAR", awayFull:"Carolina Panthers",        home:"PHI", homeFull:"Philadelphia Eagles",     venue:"Lincoln Financial Field",    network:"FOX" },
  { week:13, dayOffset:3, hour:16, away:"DAL", awayFull:"Dallas Cowboys",           home:"NYG", homeFull:"New York Giants",         venue:"MetLife Stadium",            network:"FOX" },
  { week:13, dayOffset:3, hour:16, away:"CHI", awayFull:"Chicago Bears",            home:"MIN", homeFull:"Minnesota Vikings",       venue:"U.S. Bank Stadium",          network:"FOX" },
  { week:13, dayOffset:3, hour:16, away:"LAC", awayFull:"Los Angeles Chargers",     home:"DEN", homeFull:"Denver Broncos",          venue:"Empower Field",              network:"CBS" },
  { week:13, dayOffset:3, hour:16, away:"ARI", awayFull:"Arizona Cardinals",        home:"SF",  homeFull:"San Francisco 49ers",     venue:"Levi's Stadium",             network:"FOX" },
  { week:13, dayOffset:4, hour:20, away:"DET", awayFull:"Detroit Lions",            home:"GB",  homeFull:"Green Bay Packers",       venue:"Lambeau Field",              network:"ABC/ESPN" },

  // WEEK 14
  { week:14, dayOffset:0, hour:20, away:"KC",  awayFull:"Kansas City Chiefs",       home:"BUF", homeFull:"Buffalo Bills",           venue:"Highmark Stadium",           network:"NBC" },
  { week:14, dayOffset:3, hour:13, away:"CIN", awayFull:"Cincinnati Bengals",       home:"BAL", homeFull:"Baltimore Ravens",        venue:"M&T Bank Stadium",           network:"CBS" },
  { week:14, dayOffset:3, hour:13, away:"NYJ", awayFull:"New York Jets",            home:"MIA", homeFull:"Miami Dolphins",          venue:"Hard Rock Stadium",          network:"CBS" },
  { week:14, dayOffset:3, hour:13, away:"PIT", awayFull:"Pittsburgh Steelers",      home:"IND", homeFull:"Indianapolis Colts",      venue:"Lucas Oil Stadium",          network:"CBS" },
  { week:14, dayOffset:3, hour:13, away:"TEN", awayFull:"Tennessee Titans",         home:"JAX", homeFull:"Jacksonville Jaguars",    venue:"EverBank Stadium",           network:"CBS" },
  { week:14, dayOffset:3, hour:13, away:"WAS", awayFull:"Washington Commanders",    home:"NO",  homeFull:"New Orleans Saints",      venue:"Caesars Superdome",          network:"FOX" },
  { week:14, dayOffset:3, hour:13, away:"NYG", awayFull:"New York Giants",          home:"TB",  homeFull:"Tampa Bay Buccaneers",    venue:"Raymond James Stadium",      network:"FOX" },
  { week:14, dayOffset:3, hour:16, away:"PHI", awayFull:"Philadelphia Eagles",      home:"GB",  homeFull:"Green Bay Packers",       venue:"Lambeau Field",              network:"FOX" },
  { week:14, dayOffset:3, hour:16, away:"MIN", awayFull:"Minnesota Vikings",        home:"DAL", homeFull:"Dallas Cowboys",          venue:"AT&T Stadium",               network:"FOX" },
  { week:14, dayOffset:3, hour:16, away:"LV",  awayFull:"Las Vegas Raiders",        home:"SEA", homeFull:"Seattle Seahawks",        venue:"Lumen Field",                network:"FOX" },
  { week:14, dayOffset:3, hour:16, away:"LAR", awayFull:"Los Angeles Rams",         home:"ARI", homeFull:"Arizona Cardinals",       venue:"State Farm Stadium",         network:"FOX" },
  { week:14, dayOffset:3, hour:16, away:"DEN", awayFull:"Denver Broncos",           home:"KC",  homeFull:"Kansas City Chiefs",      venue:"GEHA Field at Arrowhead",    network:"CBS" },
  { week:14, dayOffset:4, hour:20, away:"SF",  awayFull:"San Francisco 49ers",      home:"DET", homeFull:"Detroit Lions",           venue:"Ford Field",                 network:"ABC/ESPN" },

  // WEEK 15
  { week:15, dayOffset:0, hour:20, away:"DET", awayFull:"Detroit Lions",            home:"GB",  homeFull:"Green Bay Packers",       venue:"Lambeau Field",              network:"NBC" },
  { week:15, dayOffset:3, hour:13, away:"BAL", awayFull:"Baltimore Ravens",         home:"PIT", homeFull:"Pittsburgh Steelers",     venue:"Acrisure Stadium",           network:"CBS" },
  { week:15, dayOffset:3, hour:13, away:"BUF", awayFull:"Buffalo Bills",            home:"NE",  homeFull:"New England Patriots",    venue:"Gillette Stadium",           network:"CBS" },
  { week:15, dayOffset:3, hour:13, away:"HOU", awayFull:"Houston Texans",           home:"IND", homeFull:"Indianapolis Colts",      venue:"Lucas Oil Stadium",          network:"CBS" },
  { week:15, dayOffset:3, hour:13, away:"CLE", awayFull:"Cleveland Browns",         home:"TEN", homeFull:"Tennessee Titans",        venue:"Nissan Stadium",             network:"CBS" },
  { week:15, dayOffset:3, hour:13, away:"NYG", awayFull:"New York Giants",          home:"WAS", homeFull:"Washington Commanders",   venue:"Northwest Stadium",          network:"FOX" },
  { week:15, dayOffset:3, hour:13, away:"NO",  awayFull:"New Orleans Saints",       home:"ATL", homeFull:"Atlanta Falcons",         venue:"Mercedes-Benz Stadium",      network:"FOX" },
  { week:15, dayOffset:3, hour:13, away:"TB",  awayFull:"Tampa Bay Buccaneers",     home:"CAR", homeFull:"Carolina Panthers",       venue:"Bank of America Stadium",    network:"FOX" },
  { week:15, dayOffset:3, hour:16, away:"DAL", awayFull:"Dallas Cowboys",           home:"CHI", homeFull:"Chicago Bears",           venue:"Soldier Field",              network:"FOX" },
  { week:15, dayOffset:3, hour:16, away:"MIN", awayFull:"Minnesota Vikings",        home:"SF",  homeFull:"San Francisco 49ers",     venue:"Levi's Stadium",             network:"FOX" },
  { week:15, dayOffset:3, hour:16, away:"KC",  awayFull:"Kansas City Chiefs",       home:"LAC", homeFull:"Los Angeles Chargers",    venue:"SoFi Stadium",               network:"CBS" },
  { week:15, dayOffset:3, hour:16, away:"SEA", awayFull:"Seattle Seahawks",         home:"LAR", homeFull:"Los Angeles Rams",        venue:"SoFi Stadium",               network:"FOX" },
  { week:15, dayOffset:4, hour:20, away:"PHI", awayFull:"Philadelphia Eagles",      home:"NYJ", homeFull:"New York Jets",           venue:"MetLife Stadium",            network:"ABC/ESPN" },

  // WEEK 16
  { week:16, dayOffset:0, hour:20, away:"KC",  awayFull:"Kansas City Chiefs",       home:"LAR", homeFull:"Los Angeles Rams",        venue:"SoFi Stadium",               network:"NBC" },
  { week:16, dayOffset:3, hour:13, away:"MIA", awayFull:"Miami Dolphins",           home:"BUF", homeFull:"Buffalo Bills",           venue:"Highmark Stadium",           network:"CBS" },
  { week:16, dayOffset:3, hour:13, away:"CIN", awayFull:"Cincinnati Bengals",       home:"PIT", homeFull:"Pittsburgh Steelers",     venue:"Acrisure Stadium",           network:"CBS" },
  { week:16, dayOffset:3, hour:13, away:"JAX", awayFull:"Jacksonville Jaguars",     home:"IND", homeFull:"Indianapolis Colts",      venue:"Lucas Oil Stadium",          network:"CBS" },
  { week:16, dayOffset:3, hour:13, away:"TEN", awayFull:"Tennessee Titans",         home:"HOU", homeFull:"Houston Texans",          venue:"NRG Stadium",                network:"CBS" },
  { week:16, dayOffset:3, hour:13, away:"NYG", awayFull:"New York Giants",          home:"NO",  homeFull:"New Orleans Saints",      venue:"Caesars Superdome",          network:"FOX" },
  { week:16, dayOffset:3, hour:13, away:"CAR", awayFull:"Carolina Panthers",        home:"ATL", homeFull:"Atlanta Falcons",         venue:"Mercedes-Benz Stadium",      network:"FOX" },
  { week:16, dayOffset:3, hour:13, away:"WAS", awayFull:"Washington Commanders",    home:"TB",  homeFull:"Tampa Bay Buccaneers",    venue:"Raymond James Stadium",      network:"FOX" },
  { week:16, dayOffset:3, hour:16, away:"DAL", awayFull:"Dallas Cowboys",           home:"MIN", homeFull:"Minnesota Vikings",       venue:"U.S. Bank Stadium",          network:"FOX" },
  { week:16, dayOffset:3, hour:16, away:"DET", awayFull:"Detroit Lions",            home:"CHI", homeFull:"Chicago Bears",           venue:"Soldier Field",              network:"FOX" },
  { week:16, dayOffset:3, hour:16, away:"SF",  awayFull:"San Francisco 49ers",      home:"ARI", homeFull:"Arizona Cardinals",       venue:"State Farm Stadium",         network:"FOX" },
  { week:16, dayOffset:3, hour:16, away:"LV",  awayFull:"Las Vegas Raiders",        home:"DEN", homeFull:"Denver Broncos",          venue:"Empower Field",              network:"CBS" },
  { week:16, dayOffset:4, hour:20, away:"BAL", awayFull:"Baltimore Ravens",         home:"CIN", homeFull:"Cincinnati Bengals",      venue:"Paycor Stadium",             network:"ABC/ESPN" },

  // WEEK 17
  { week:17, dayOffset:0, hour:20, away:"PHI", awayFull:"Philadelphia Eagles",      home:"DAL", homeFull:"Dallas Cowboys",          venue:"AT&T Stadium",               network:"NBC" },
  { week:17, dayOffset:3, hour:13, away:"BAL", awayFull:"Baltimore Ravens",         home:"MIA", homeFull:"Miami Dolphins",          venue:"Hard Rock Stadium",          network:"CBS" },
  { week:17, dayOffset:3, hour:13, away:"BUF", awayFull:"Buffalo Bills",            home:"NE",  homeFull:"New England Patriots",    venue:"Gillette Stadium",           network:"CBS" },
  { week:17, dayOffset:3, hour:13, away:"PIT", awayFull:"Pittsburgh Steelers",      home:"CLE", homeFull:"Cleveland Browns",        venue:"Huntington Bank Field",      network:"CBS" },
  { week:17, dayOffset:3, hour:13, away:"IND", awayFull:"Indianapolis Colts",       home:"JAX", homeFull:"Jacksonville Jaguars",    venue:"EverBank Stadium",           network:"CBS" },
  { week:17, dayOffset:3, hour:13, away:"TEN", awayFull:"Tennessee Titans",         home:"HOU", homeFull:"Houston Texans",          venue:"NRG Stadium",                network:"CBS" },
  { week:17, dayOffset:3, hour:13, away:"ATL", awayFull:"Atlanta Falcons",          home:"NO",  homeFull:"New Orleans Saints",      venue:"Caesars Superdome",          network:"FOX" },
  { week:17, dayOffset:3, hour:13, away:"TB",  awayFull:"Tampa Bay Buccaneers",     home:"WAS", homeFull:"Washington Commanders",   venue:"Northwest Stadium",          network:"FOX" },
  { week:17, dayOffset:3, hour:16, away:"GB",  awayFull:"Green Bay Packers",        home:"DET", homeFull:"Detroit Lions",           venue:"Ford Field",                 network:"FOX" },
  { week:17, dayOffset:3, hour:16, away:"MIN", awayFull:"Minnesota Vikings",        home:"CHI", homeFull:"Chicago Bears",           venue:"Soldier Field",              network:"FOX" },
  { week:17, dayOffset:3, hour:16, away:"LAC", awayFull:"Los Angeles Chargers",     home:"LV",  homeFull:"Las Vegas Raiders",       venue:"Allegiant Stadium",          network:"CBS" },
  { week:17, dayOffset:3, hour:16, away:"SEA", awayFull:"Seattle Seahawks",         home:"SF",  homeFull:"San Francisco 49ers",     venue:"Levi's Stadium",             network:"FOX" },
  { week:17, dayOffset:4, hour:20, away:"CIN", awayFull:"Cincinnati Bengals",       home:"KC",  homeFull:"Kansas City Chiefs",      venue:"GEHA Field at Arrowhead",    network:"ABC/ESPN" },

  // WEEK 18
  { week:18, dayOffset:6, hour:13, away:"KC",  awayFull:"Kansas City Chiefs",       home:"LAC", homeFull:"Los Angeles Chargers",    venue:"SoFi Stadium",               network:"CBS" },
  { week:18, dayOffset:6, hour:13, away:"BAL", awayFull:"Baltimore Ravens",         home:"PIT", homeFull:"Pittsburgh Steelers",     venue:"Acrisure Stadium",           network:"CBS" },
  { week:18, dayOffset:6, hour:13, away:"BUF", awayFull:"Buffalo Bills",            home:"MIA", homeFull:"Miami Dolphins",          venue:"Hard Rock Stadium",          network:"CBS" },
  { week:18, dayOffset:6, hour:13, away:"HOU", awayFull:"Houston Texans",           home:"IND", homeFull:"Indianapolis Colts",      venue:"Lucas Oil Stadium",          network:"CBS" },
  { week:18, dayOffset:6, hour:13, away:"TEN", awayFull:"Tennessee Titans",         home:"JAX", homeFull:"Jacksonville Jaguars",    venue:"EverBank Stadium",           network:"CBS" },
  { week:18, dayOffset:6, hour:13, away:"NE",  awayFull:"New England Patriots",     home:"CLE", homeFull:"Cleveland Browns",        venue:"Huntington Bank Field",      network:"CBS" },
  { week:18, dayOffset:6, hour:13, away:"ATL", awayFull:"Atlanta Falcons",          home:"TB",  homeFull:"Tampa Bay Buccaneers",    venue:"Raymond James Stadium",      network:"FOX" },
  { week:18, dayOffset:6, hour:13, away:"CAR", awayFull:"Carolina Panthers",        home:"NO",  homeFull:"New Orleans Saints",      venue:"Caesars Superdome",          network:"FOX" },
  { week:18, dayOffset:6, hour:13, away:"NYG", awayFull:"New York Giants",          home:"WAS", homeFull:"Washington Commanders",   venue:"Northwest Stadium",          network:"FOX" },
  { week:18, dayOffset:6, hour:13, away:"PHI", awayFull:"Philadelphia Eagles",      home:"DAL", homeFull:"Dallas Cowboys",          venue:"AT&T Stadium",               network:"FOX" },
  { week:18, dayOffset:6, hour:13, away:"GB",  awayFull:"Green Bay Packers",        home:"CHI", homeFull:"Chicago Bears",           venue:"Soldier Field",              network:"FOX" },
  { week:18, dayOffset:6, hour:13, away:"DET", awayFull:"Detroit Lions",            home:"MIN", homeFull:"Minnesota Vikings",       venue:"U.S. Bank Stadium",          network:"FOX" },
  { week:18, dayOffset:6, hour:13, away:"CIN", awayFull:"Cincinnati Bengals",       home:"CLE", homeFull:"Cleveland Browns",        venue:"Huntington Bank Field",      network:"CBS" },
  { week:18, dayOffset:6, hour:13, away:"LV",  awayFull:"Las Vegas Raiders",        home:"DEN", homeFull:"Denver Broncos",          venue:"Empower Field",              network:"CBS" },
  { week:18, dayOffset:6, hour:13, away:"LAR", awayFull:"Los Angeles Rams",         home:"ARI", homeFull:"Arizona Cardinals",       venue:"State Farm Stadium",         network:"FOX" },
  { week:18, dayOffset:6, hour:13, away:"SEA", awayFull:"Seattle Seahawks",         home:"LAC", homeFull:"Los Angeles Chargers",    venue:"SoFi Stadium",               network:"FOX" },
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  let inserted = 0;
  let updated = 0;

  for (const g of GAMES) {
    const kickoff = weekDate(g.week, g.dayOffset, g.hour);
    const baseSlug = slugify(`${g.awayFull}-at-${g.homeFull}-week-${g.week}`, {
      lower: true,
      strict: true,
    });

    const result = await Game.findOneAndUpdate(
      { slug: baseSlug },
      {
        slug: baseSlug,
        season: 2026,
        week: g.week,
        homeTeam: g.home,
        awayTeam: g.away,
        homeTeamFull: g.homeFull,
        awayTeamFull: g.awayFull,
        venue: g.venue,
        network: g.network,
        kickoff,
        status: "scheduled",
        affiliateUrl: AFFILIATE_URL,
        viewerCountBase: 10000 + Math.floor(Math.random() * 25000),
        featured: g.week === 1,
      },
      { upsert: true, new: true, rawResult: true }
    );

    if ((result as any).lastErrorObject?.updatedExisting) updated++;
    else inserted++;
  }

  console.log(`Done: ${inserted} inserted, ${updated} updated. Total games: ${GAMES.length}`);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
