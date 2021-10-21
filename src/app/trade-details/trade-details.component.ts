import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { TradeStateService } from '../trade-state.service';

export interface Trade {
  id: number;
  entryDate: string;
  entryPrice: number;
  exitDate: string;
  exitPrice: number;
  profit?: number;
}

@Component({
  selector: 'app-trade-details',
  templateUrl: './trade-details.component.html',
  styleUrls: ['./trade-details.component.css'],
})
export class TradeDetailsComponent {
  @ViewChild('tradeDetailsModal') tradeDetailsModal: TemplateRef<any>;
  @ViewChild('tradeEditDetailsModal') tradeEditDetailsModal: TemplateRef<any>;

  selectedTrade = this.fb.group({
    entryDate: new FormControl('',
    [Validators.required],
    ),
    entryPrice: new FormControl('',
    [Validators.required, Validators.min(0)]
    ),
    exitDate: new FormControl('',
    [Validators.required]
    ),
    exitPrice: new FormControl('',
    [Validators.required, Validators.min(0)])
  },
{
  validator: this.checkMatchValidator('entryDate', 'exitDate')
}
);

  editModal = false;


  public tradeStateService$: BehaviorSubject<Array<Trade>>;
  public balance$: BehaviorSubject<number>;

  constructor(
    private tradeStateService: TradeStateService,
    private fb: FormBuilder,
    public dialog: MatDialog) {
      this.tradeStateService$ = this.tradeStateService.tradeHistory$;
      this.balance$ = this.tradeStateService.balance$;
    }

  openAddModal(): void {
    this.selectedTrade = this.fb.group({
      entryDate: new FormControl('',
      [Validators.required],
      ),
      entryPrice: new FormControl('',
      [Validators.required, Validators.pattern('^[0-9]+$')]
      ),
      exitDate: new FormControl('',
      [Validators.required]
      ),
      exitPrice: new FormControl('',
      [Validators.required, Validators.pattern('^[0-9]+$')])
    },
      {
        validator: this.checkMatchValidator('entryDate', 'exitDate')
      }
    );

    this.editModal = false;
    const dialogRef = this.dialog.open(this.tradeDetailsModal, {
      width: '350px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
          if (result !== 'closed') {
            this.tradeStateService.addTrade(this.selectedTrade.value);
          }
      }
    });
  }

  checkMatchValidator(entryDate: string, exitDate: string): ValidatorFn {
    return (frm: AbstractControl) => {
      if (!frm) {
        return null;
      }
      const dateStart = frm.get(entryDate).value;
      const dateEnd = frm.get(exitDate).value;
      if (dateStart > dateEnd) {
        return {dateError: true};
      }
      return null;
    };
  }

  openEditModal(trade: any): void {
    trade.entryDate = moment(trade.entryDate, 'MMMM DD YYYY').toDate();
    trade.exitDate = moment(trade.exitDate, 'MMMM DD YYYY').toDate();
    this.editModal = true;
    this.selectedTrade = this.fb.group({
      entryDate: new FormControl(trade.entryDate,
      [Validators.required]
      ),
      entryPrice: new FormControl( trade.entryPrice,
      [Validators.required, Validators.pattern('^[0-9]+$')]
      ),
      exitDate: new FormControl(trade.exitDate,
      [Validators.required]
      ),
      exitPrice: new FormControl(trade.exitPrice,
      [Validators.required, Validators.pattern('^[0-9]+$')]),
      id: trade.id
    },
      {
        validator: this.checkMatchValidator('entryDate', 'exitDate')
      }
    );

    const dialogRef = this.dialog.open(this.tradeDetailsModal, {
      width: '350px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result !== 'closed') {
          this.tradeStateService.editTrade(result.value);
        }
      }
    });
  }

}
