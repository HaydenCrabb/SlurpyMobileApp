import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
})
export class ModalPage implements OnInit {

  constructor(public modal: ModalController, public params: NavParams) { }

  ngOnInit() {
  	this.theLastScore = this.params.get('points');
  	this.highscore = "Highscore: " + this.params.get('highscore');
  	if (this.params.get('newHighscore') == true)
  	{
  		this.highscore = "New Highscore: " + this.highscore + "!!!";
  	}
  	console.log(this.highscore);
  }

  theLastScore = 0;
  highscore = "Highscore: ";

  dismiss(data) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modal.dismiss(data);
  }

}
