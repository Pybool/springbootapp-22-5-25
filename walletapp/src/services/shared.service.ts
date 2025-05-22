// shared.service.ts
import { HttpClient } from '@angular/common/http';
import {  Injectable, ViewContainerRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, take } from 'rxjs';
import { cyIcons } from '../cy.icons';
import { SnackBarService } from './snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private componentStateSubject: BehaviorSubject<any> =
    new BehaviorSubject<any>(null);
  safeContent!: SafeHtml;

  private navSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  private pageTitleSubject$: BehaviorSubject<any> = new BehaviorSubject<string>(
    ''
  );
  private terminateSubject = new Subject<boolean>();
  terminate$ = this.terminateSubject.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private snackbarService: SnackBarService
  ) {}

  toggleComponent(route: string) {
    this.router.navigate([route]);
  }

  setActiveComponentState(componentState: any): void {
    this.componentStateSubject.next(componentState);
  }

  getActiveComponent(): Observable<any> {
    return this.componentStateSubject.asObservable();
  }

  setPageTitle(title: string): void {
    this.pageTitleSubject$.next(title);
  }

  getPageTitle(): Observable<any> {
    return this.pageTitleSubject$.asObservable();
  }

  // Add the following TypeScript code to your component
  setToggleNavState(status: string) {
    if (status == 'show') {
      this.navSubject.next(true);
    } else {
      this.navSubject.next(false);
    }
  }

  getToggleNavState(): Observable<any> {
    return this.navSubject.asObservable();
  }

  terminateModals() {
    console.log("Terminating modals");
    this.terminateSubject.next(true);
  }


  copyAddressToClipBoard(textToCopy: string): void {
    // Copy the wallet address to the clipboard
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        this.snackbarService.showWithIcon('Copied to clipboard');
        setTimeout(() => {
          this.snackbarService.hide();
        }, 2000);
      })
      .catch((error) => {
        // If an error occurs while copying, show an error message
        this.snackbarService.showWithIcon(
          'Failed to copy ',
          cyIcons.TIMEOUT_ERR
        );
        console.error('Error copying to clipboard: ', error);
      });
  }

  highlightTextInElement(elementSelector: any, searchText: string) {
    const element = document.querySelector(elementSelector);

    if (element) {
      // Check if the search text is empty or only spaces
      if (!searchText.trim()) {
        return; // If empty or whitespace, do nothing
      }

      // Remove previous highlighted spans
      let content = element.innerHTML;
      content = content.replace(
        /<span class="highlight">.*?<\/span>/g,
        (match: string) =>
          match.replace(/<span class="highlight">|<\/span>/g, '')
      );

      // Apply new highlighting
      const regex = new RegExp(searchText, 'gi'); // Case-insensitive global search
      content = content.replace(regex, (match: any) => {
        return `<span class="highlight">${match}</span>`;
      });

      // Sanitize and update the inner HTML
      const safeHtml = this.sanitizer
        .bypassSecurityTrustHtml(content)
        .toString() as string;

      element.innerHTML = safeHtml
        .replaceAll(`SafeValue must use [property]=binding:`, '')
        .replaceAll(`(see https://g.co/ng/security#xss)`, '');
    }
  }

  setActiveNavItem(navItemClass: string) {
    setTimeout(() => {
      const navItem = Array.from(
        document.getElementsByClassName(navItemClass)
      ) as any;
      if (navItem) {
        const navItems = Array.from(
          document.getElementsByClassName('nav-item')
        ) as any;
        navItems.forEach((navItem: any) => {
          navItem.style.borderBottom =
            '0px ' + getComputedStyle(document.body).getPropertyValue('#ffff');
        });
        try {
          const navIcons = Array.from(
            document.getElementsByClassName('nav-icon')
          ) as any;
          navIcons.forEach((navIcon: any) => {
            navIcon.classList.add('hover');
          });
          const item: any = Array.from(navItem)[0];
          const activeLink = item.children[0] as any;
          activeLink.classList.remove('hover');
        } catch {}
        const selectedNavItem = navItem[0];
        selectedNavItem.style.borderBottom =
          '2px solid ' +
            getComputedStyle(document.body).getPropertyValue(
              '--Button-Primary-Selected'
            ) || '#072c15';
        selectedNavItem.style.borderRadius = '0px';
      }
    }, 100);
  }
}
