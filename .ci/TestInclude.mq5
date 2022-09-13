#property copyright "Copyright 2022, Martijn Riemers"
#property link      "https://github.com/mhriemers/metatrader-action"
#property version   "1.00"
#property strict

#include <HelloWorld.mqh>

int OnInit() {
  HelloWorld();

  return (INIT_SUCCEEDED);
}

void OnDeinit(const int reason) {}

void OnTick() {}