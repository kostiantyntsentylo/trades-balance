import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { Trade } from './trade-details/trade-details.component';

const DEFAULT_TRADE_HISTORY: Trade[] = [];


interface BalanceByDate {
    date: string;
    balance: number;
}


interface BalanceByDateSubject {
  data: {data: number[], label: string}[];
  labels: string[];
}

@Injectable({ providedIn: 'root' })
export class TradeStateService {
  private historyTrades: Trade[] = [];
  private balance = 0;
  private balanceByDate: BalanceByDate[] = [];
  private balanceByDateSubject: BalanceByDateSubject = {
    data: [{data: [], label: 'Balance'}],
    labels: []
  };

  public tradeHistory$: BehaviorSubject<Trade[]> = new BehaviorSubject<Trade[]>(DEFAULT_TRADE_HISTORY);
  public balance$: BehaviorSubject<number> = new BehaviorSubject<number>(this.balance);
  public balanceByDate$: BehaviorSubject<BalanceByDateSubject> = new BehaviorSubject<BalanceByDateSubject>(this.balanceByDateSubject);

  public addTrade(trade: Trade): void {
    this.historyTrades = this.tradeHistory$.getValue();
    trade.exitDate = moment(trade.exitDate).format('MMMM DD YYYY');
    trade.entryDate = moment(trade.entryDate).format('MMMM DD YYYY');
    trade.id = this.historyTrades.length ? this.historyTrades[this.historyTrades.length - 1].id + 1 : 1;
    trade.profit = trade.exitPrice - trade.entryPrice;
    this.historyTrades.push(trade);
    this.tradeHistory$.next(this.historyTrades);
    this.calculateBalance();
    this.calcBalanceByDate();
  }

  public calcBalanceByDate(): void {
    this.historyTrades = this.tradeHistory$.getValue().sort((a: any, b: any) => {
      const firstElement = moment(a.exitDate, 'MMMM DD YYYY').unix();
      const secondElement = moment(b.exitDate, 'MMMM DD YYYY').unix();
      return firstElement - secondElement;
    });
    this.balanceByDate = [];
    this.balance = 0;
    for (const trade of this.historyTrades) {
      const index = this.balanceByDate.findIndex(balance => balance.date === trade.exitDate);
      if (index !== -1) {
        this.balanceByDate[index].balance += trade.profit;
      }
      else {
        const prevIndex = this.balanceByDate.length - 1;
        if (prevIndex !== -1) {
          this.balanceByDate.push({
            date: trade.exitDate,
            balance: this.balanceByDate[prevIndex].balance + trade.profit
          });
        }
        else {
          this.balanceByDate.push({
            date: trade.exitDate,
            balance: this.balance + + trade.profit
          });
        }
      }
    }

    this.balanceByDateSubject =
      { data: [{data: [], label: 'Balance'}], labels: [] };
    for (const balance of this.balanceByDate) {
      this.balanceByDateSubject.data[0].data.push(balance.balance);
      this.balanceByDateSubject.labels.push(balance.date);
    }

    this.balanceByDate$.next(this.balanceByDateSubject);
    this.calculateBalance();
  }

  public editTrade(trade: Trade): void {
    this.historyTrades = this.tradeHistory$.getValue();
    trade.entryDate = moment(trade.entryDate).format('MMMM DD YYYY');
    trade.exitDate = moment(trade.exitDate).format('MMMM DD YYYY');
    trade.profit = trade.exitPrice - trade.entryPrice;
    const foundIndex = this.historyTrades.findIndex(x => x.id === trade.id);
    this.historyTrades[foundIndex] = trade;
    this.calcBalanceByDate();
    this.calculateBalance();
    this.tradeHistory$.next(this.historyTrades);
  }

  public calculateBalance(): void {
    this.balance = this.historyTrades.reduce((acc, current) => acc + current.profit, 0);
    this.balance$.next(this.balance);
  }
}
