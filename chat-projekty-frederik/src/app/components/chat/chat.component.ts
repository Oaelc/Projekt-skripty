import { Component } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { User, Chat } from '../../types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
  users: User[] = [];
  userDetails: any = {};
  allChats: Chat[] = [];
  chatMessages: Chat[] = [];
  firstName: string | null = localStorage.getItem('firstName');
  lastName: string | null = localStorage.getItem('lastName');
  loggedInTime: string | null = localStorage.getItem('loginTime');
  detailId: number = 0;

  clickCount: number = 0;
  async handleClick(): Promise<void> {
    this.clickCount++;
  }

  chatsCount: number = 0;
  async handleChatsOpened(): Promise<void> {
    this.chatsCount++;
  }

  charCount: number = 0;
  prevInputValue: string = '';
  async onCharInput(event: Event): Promise<void> {
    const inputValue = (event.target as HTMLInputElement).value;
    if (inputValue.length > this.prevInputValue.length) {
      this.charCount++;
    }
    this.prevInputValue = inputValue;
  }

  constructor(private httpClient: HttpClient, private router: Router) {
    this.getUsers().subscribe((users) => {
      this.users = users.filter(
        (user) =>
          user.firstName !== this.firstName && user.lastName !== this.lastName
      );
    });

    this.getUserDetails().subscribe((userDetails) => {
      this.userDetails = userDetails;
    });
  }

  loggedTime: string = '';
  splittedLoggedTime: string[] = [];
  isLoggedIn: boolean = false;
  ngOnInit() {
    if (localStorage.getItem('log') != 't') {
      this.router.navigate(['./login']);
    }

    this.isLoggedIn = true;

    if (this.loggedInTime) {
      const [day, month, year, time] = this.loggedInTime.split(' ');
      this.loggedTime = `${year} ${month} ${day} ${time}`;
    }

    this.getUsers()
      .pipe(
        map((users) =>
          users.filter(
            (user) =>
              user.firstName !== this.firstName &&
              user.lastName !== this.lastName
          )
        ),
        tap((users) => (this.users = users))
      )
      .subscribe();

    this.userIdChanges()
      .pipe(
        tap((userId) => (this.userId = userId)),
        switchMap(() => this.getUserDetails())
      )
      .subscribe((userDetails) => (this.userDetails = userDetails));
  }

  handleUserClick(id: number) {
    this.detailId = id;
    if (this.userClicked == false) {
      this.userClicked = true;
    } else if (this.userClicked == true) {
      this.userClicked = false;
    }
  }

  private getUsers(): Observable<User[]> {
    return this.httpClient
      .get('https://dummyjson.com/users')
      .pipe(map((res: any) => res.users as User[]));
  }

  getUserDetails(): Observable<User[]> {
    return this.httpClient
      .get('https://dummyjson.com/users/' + this.userId.toString())
      .pipe(map((res: any) => res));
  }

  userClicked: boolean = false;
  userId: number = 5;
  userIdChanges(): Observable<number> {
    const subject = new Subject<number>();

    return this.httpClient
      .get('https://dummyjson.com/users/' + this.userId.toString())
      .pipe(
        map((res: any) => res.userId),
        tap((userId) => subject.next(userId)),
        switchMap(() => subject)
      );
  }

  chatTitle: string = '';
  showChat: boolean = false;
  message: string = '';
  responseMessage: string = '';
  lenJsonText: number = 0;
  lastOriginNum: number = 0;
  postTime: string = '';
  responseTime: string = '';
  text: string = '';
  totalLenResponses: number = 0;
  post(bodyText: string) {
    const url = 'http://httpbin.org/post';
    const postMessage$ = this.httpClient.post<any>(url, { text: bodyText });

    postMessage$.subscribe((response) => {
      const message = response.json.text;
      const lenJsonText = message.length;
      const lastOriginNum = Number(response.origin.slice(-1));
      const responseMessage = 'A'.repeat(lenJsonText + lastOriginNum);
      const responseTime = new Date().toLocaleTimeString();

      const chat = {
        text: message,
        sendTime: this.postTime,
        receiver: this.chatTitle,
        response: responseMessage,
        responseTime: responseTime,
      };

      this.allChats.push(chat);
      this.chatMessages.push(chat);

      this.totalLenResponses = this.allChats.reduce(
        (acc, cur) => acc + cur.response.length,
        0
      );
    });
  }

  handleSubmit(e: any): void {
    e.preventDefault();
    if (this.text.trim() !== '') {
      const time = new Date();
      this.postTime = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
      this.post(this.text);
      this.text = '';
    }
  }

  handleKeyUp(e: any) {
    if (e.keyCode === 13) {
      this.handleSubmit(e);
    }
  }

  showUserDetails(newUserId: number) {
    this.userId = newUserId;
    this.getUserDetails().subscribe((userDetails) => {
      this.userDetails = userDetails;
      this.toggleMoreData();
    });
    this.detailShow = true;
  }

  genderData: any = {};
  zipData: any = {};
  showMoreData: boolean = true;
  detailShow: boolean = false;
  toggleMoreData() {
    const zipCodeRequest$ = this.httpClient.get(
      'https://api.zippopotam.us/us/' +
        this.userDetails.company.address.postalCode
    );
    const genderRequest$ = this.httpClient.get(
      'https://api.genderize.io/?name=' + this.userDetails.firstName
    );

    forkJoin([zipCodeRequest$, genderRequest$]).subscribe(
      ([zipData, genderData]) => {
        this.zipData = zipData;
        this.genderData = genderData;
        this.showMoreData = true;
      }
    );
  }

  logoutTime: string = '';
  secondsLogged: number = 0;
  minutesLogged: number = 0;
  hoursLogged: number = 0;
  handleLogout(): void {
    this.isLoggedIn = false;
    this.logoutTime = new Date().toString();

    if (this.loggedInTime) {
      const loggedInTime = new Date(this.loggedInTime);
      const logoutTime = new Date(this.logoutTime);
      const diffInMilliseconds = Math.abs(
        logoutTime.getTime() - loggedInTime.getTime()
      );
      this.hoursLogged = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
      this.minutesLogged = Math.floor((diffInMilliseconds / (1000 * 60)) % 60);
      this.secondsLogged = Math.floor((diffInMilliseconds / 1000) % 60);
    } else {
      this.hoursLogged = 0;
      this.minutesLogged = 0;
      this.secondsLogged = 0;
    }

    const timeString =
      ('0' + this.hoursLogged).slice(-2) +
      ':' +
      ('0' + this.minutesLogged).slice(-2) +
      ':' +
      ('0' + this.secondsLogged).slice(-2);

    localStorage.setItem('charLen', this.totalLenResponses.toString());
    localStorage.setItem("timeLogged", timeString)
    localStorage.removeItem('log');
    this.router.navigate(['./logout']);
  }

  hideData() {
    this.showMoreData = false;
  }

  closeUserDetails() {
    this.detailShow = false;
  }

  closeChat() {
    this.chatMessages = [];
    this.showChat = false;
  }
}
