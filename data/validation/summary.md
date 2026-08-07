```
================ BACKTEST SUMMARY (PPR, expected-games line) ================

--- 2023 ---
pos     n     MAE    RMSE    rho | base MAE base rho  verdict
QB     50    85.1    99.6  0.450 |    108.3    0.303  beats baseline
RB     85    59.7    74.6  0.542 |     79.6    0.316  beats baseline
WR    122    58.2    75.3  0.558 |     64.6    0.449  beats baseline
TE     54    47.5    61.3  0.353 |     48.4    0.375  beats baseline
  calibration (projected tier -> mean projected / mean actual):
         0-50: n= 39  proj   34.8  actual  100.7
       50-100: n=116  proj   75.0  actual   82.4
      100-150: n= 86  proj  118.9  actual  146.3
      150-200: n= 52  proj  168.1  actual  212.1
      200-250: n= 14  proj  221.0  actual  208.8
        250-+: n=  4  proj  292.6  actual  273.2

--- 2024 ---
pos     n     MAE    RMSE    rho | base MAE base rho  verdict
QB     47    79.0    96.2  0.638 |    100.6    0.354  beats baseline
RB     86    64.1    81.4  0.532 |     67.5    0.597  beats baseline
WR    118    55.8    68.6  0.582 |     75.3    0.404  beats baseline
TE     50    51.5    63.7  0.429 |     57.1    0.415  beats baseline
  calibration (projected tier -> mean projected / mean actual):
         0-50: n= 40  proj   34.7  actual  103.3
       50-100: n=107  proj   77.2  actual   89.3
      100-150: n= 88  proj  120.7  actual  142.7
      150-200: n= 53  proj  170.6  actual  228.4
      200-250: n=  9  proj  225.1  actual  263.0
        250-+: n=  4  proj  271.0  actual  303.6

--- 2025 ---
pos     n     MAE    RMSE    rho | base MAE base rho  verdict
QB     47    74.7    87.2  0.635 |     95.7    0.477  beats baseline
RB     84    59.4    75.7  0.650 |     75.0    0.402  beats baseline
WR    122    53.8    66.7  0.506 |     66.0    0.426  beats baseline
TE     48    42.3    54.5  0.499 |     65.5    0.212  beats baseline
  calibration (projected tier -> mean projected / mean actual):
         0-50: n= 34  proj   34.6  actual   89.6
       50-100: n=120  proj   72.9  actual   82.3
      100-150: n= 73  proj  120.0  actual  144.9
      150-200: n= 50  proj  172.0  actual  206.4
      200-250: n= 18  proj  218.7  actual  258.8
        250-+: n=  6  proj  270.5  actual  276.6

!! CASES WHERE THE NAIVE 'LAST SEASON REPEATS' BASELINE WINS:
   2023 TE: baseline ranks better (rho 0.375 vs model 0.353)
   2024 RB: baseline ranks better (rho 0.597 vs model 0.532)
```
