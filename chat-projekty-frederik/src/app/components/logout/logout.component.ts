import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../types';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css'],
})
export class LogoutComponent {
  charLen: string | null = localStorage.getItem('charLen');
  loggedTime: string | null = localStorage.getItem('timeLogged');

  constructor(
    private appRouter: Router,
  ) {
  }

  ngOnInit(): void {
    if (localStorage.getItem('log') == 't') {
      this.appRouter.navigate(['./']);
    }
  }

  close() {
    localStorage.removeItem("charLen")
    localStorage.removeItem("timeLogged")
    this.appRouter.navigate(["./login"])
  }

}
