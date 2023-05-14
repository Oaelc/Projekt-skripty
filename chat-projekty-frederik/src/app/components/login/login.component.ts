import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../types';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  userList: User[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private appRouter: Router,
    private http: HttpClient
  ) {
    this.getUsers().subscribe((userList: any) => {
      this.userList = userList;
    });
  }

  ngOnInit(): void {
    if (localStorage.getItem('log') == 't') {
      this.appRouter.navigate(['./']);
    }
  }

  private getUsers(): Observable<User[]> {
    return this.http
      .get('https://dummyjson.com/users')
      .pipe(map((res: any) => res.users as User[]));
  }

  login(first: string, last: string): void {
    if (
      this.userList.find((data: { firstName: string; lastName: string }) => {
        return data.firstName === first && data.lastName === last;
      }) != undefined
    ) {
      localStorage.setItem('firstName', first);
      localStorage.setItem('lastName', last);
      localStorage.setItem('loginTime', new Date().toString());
      localStorage.setItem('log', 't');
      this.appRouter.navigate(['./']);
    }
  }
}
