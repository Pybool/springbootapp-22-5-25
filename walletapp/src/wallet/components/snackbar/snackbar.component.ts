import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.css'],
})
export class SnackBarComponent implements OnInit {
  message: string = '';
  visible: boolean = false;
  errVisible: boolean = false;
  visibleWithIcon: boolean = false;
  visiblemsg: boolean = false;
  svgString:SafeHtml = `<span></span>`;
  private hideTimeout: any;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {}

  show(
    message: string,
    isError: boolean = false,
    duration: number = 3000
  ): void {
    this.hide()
    this.message = message;
    if (!isError) {
      this.visible = true;
    } else {
      this.errVisible = true;
    }

    // Automatically hide the snack bar after the specified duration
    if (duration > 0) {
      this.hideTimeout = setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  showWithIcon(message:string, svgString:string){
    this.hide()
    this.svgString = this.sanitizer.bypassSecurityTrustHtml(svgString);
    this.message = message;
    this.visibleWithIcon = true;
    setTimeout(() => {
      this.hide();
    }, 3000);
  }

  showmsg(message:string, svgString:string){
    this.hide()
    this.svgString = this.sanitizer.bypassSecurityTrustHtml(svgString);
    this.message = message;
    this.visiblemsg = true;
    setTimeout(() => {
      this.hide();
    }, 3000);
  }

  hide(): void {
    this.visible = false;
    this.errVisible = false;
    this.visibleWithIcon = false;
    this.visiblemsg = false;

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  }
}
