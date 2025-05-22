import { Injectable, ApplicationRef, ComponentRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { cyIcons } from '../cy.icons';
import { SnackBarComponent } from '../wallet/components/snackbar/snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {
  private snackBarRef: ComponentRef<SnackBarComponent> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector
  ) {}

  show(message: string, isError:boolean = false, duration: number = 3000): Promise<any> {
    if (!this.snackBarRef) {
      const factory = this.componentFactoryResolver.resolveComponentFactory(SnackBarComponent);
      this.snackBarRef = factory.create(this.injector);
      this.appRef.attachView(this.snackBarRef.hostView);
      const domElem = (this.snackBarRef.hostView as any).rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);
    }
    
    return new Promise((resolve:any, reject:any)=>{
      resolve(this.snackBarRef!.instance.show(message, isError, duration))
    })
    
    
  }

  showWithIcon(message: string, icon:string = cyIcons.INFO){
    if (!this.snackBarRef) {
      const factory = this.componentFactoryResolver.resolveComponentFactory(SnackBarComponent);
      this.snackBarRef = factory.create(this.injector);
      this.appRef.attachView(this.snackBarRef.hostView);
      const domElem = (this.snackBarRef.hostView as any).rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);
    }
    
    return new Promise((resolve:any, reject:any)=>{
      resolve(this.snackBarRef!.instance.showWithIcon(message, icon))
    })
  }

  showmsg(fmessage: string, icon:string = cyIcons.INFO){
    if (!this.snackBarRef) {
      const factory = this.componentFactoryResolver.resolveComponentFactory(SnackBarComponent);
      this.snackBarRef = factory.create(this.injector);
      this.appRef.attachView(this.snackBarRef.hostView);
      const domElem = (this.snackBarRef.hostView as any).rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);
    }
    
    return new Promise((resolve:any, reject:any)=>{
      resolve(this.snackBarRef!.instance.showmsg(fmessage, icon))
    })
  }

  hide(): void {
    if (this.snackBarRef) {
      this.snackBarRef.instance.hide();
      this.appRef.detachView(this.snackBarRef.hostView);
      this.snackBarRef.destroy();
      this.snackBarRef = null;
    }
  }
}
