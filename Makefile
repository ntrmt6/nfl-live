PY ?= python3

.PHONY: data projections backtest test all

data:            ## refresh the nflverse raw cache (network)
	$(PY) -m model.data_loader

projections:     ## build data/processed/*.json for the site (offline)
	$(PY) -m model.run

backtest:        ## train-through-N-1 validation for 2023-2025 (offline)
	$(PY) -m model.backtest

test:            ## model unit tests (offline, uses cached data)
	$(PY) -m pytest model/tests -q

all: data projections backtest
