import { Injectable } from '@angular/core';
import { Hero } from '../hero';
import { HEROES } from '../mock-heroes';
import { MessageService } from "./message.service";
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators'; //use to catch error

@Injectable({
  providedIn: 'root'
})

export class HeroService {

  constructor(private messageService: MessageService, private httpService: HttpClient) { }

  //Method use RxJS of() function
  // getHeroes(): Observable<Hero[]> {
  //   const heroes = of(HEROES);
  //   return heroes;
  // }
  //apiurl

  private heroesUrl = "api/heroes" //Url to webAPI

  //Method converted to HttpClient
  
  getHeroes(): Observable<Hero[]> {
    return this.httpService.get<Hero[]>(this.heroesUrl)
      .pipe(
        tap(_ => this.log('Fetched Heroes List')), //Success
        catchError(this.handleError<Hero[]>('getHeroes', [])) //Error
      );
  }

  getHeroNo404<Data>(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/?id=${id}`;
    return this.httpService.get<Hero[]>(url)
      .pipe(
        map(heroes => heroes[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? 'fetched' : 'did not find';
          this.log(`${outcome} hero id=${id}`);
        }),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
      );
  }

  //Method use RxJS of() function
  // getHero(id: number): Observable<Hero> {
  //   const hero = HEROES.find(h => h.id === id)!;
  //   return of(hero)
  // }
  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.httpService.get<Hero>(url)
      .pipe(
        tap(_ => this.log(`Selected Hero id: ${id}`)), //Success
        catchError(this.handleError<Hero>(`getHero id=${id}`)) //Error
      );
  }

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  updateHero(hero: Hero): Observable<any> {
    return this.httpService.put(this.heroesUrl, hero, this.httpOptions)
      .pipe(
        tap(_ => this.log(`Updated Hero id=${hero.id}`)),
        catchError(this.handleError<any>('updateHero'))
      );
  }

  addHero(hero: Hero): Observable<Hero> {
    return this.httpService.post<Hero>(this.heroesUrl, hero, this.httpOptions)
      .pipe(
        tap((newHero: Hero) => this.log(`Add new Hero w/ id=${newHero.id}`)),
        catchError(this.handleError<Hero>('addHero'))
      );
  }

  deleteHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`
    return this.httpService.delete<Hero>(url, this.httpOptions)
      .pipe(
        tap(_ => this.log(`Delete Hero id = ${id}`)),
        catchError(this.handleError<Hero>('deleteHero'))
      );
  }

  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      return of([]);
    }
    return this.httpService.get<Hero[]>(`${this.heroesUrl}/?name=${term}`)
    .pipe(
      tap( x => x.length ? 
          this.log(`found heroes matching "${term}"`) :
          this.log(`no heroes matching "${term}"`)
        ),
        catchError(this.handleError<Hero[]>('searchHero', []))
    )
  }

  //ErrorHandle
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      

      this.log(`${operation} FAILED: ${error.message}`)

      return of(result as T)
    };
  }

  private log(message: string): void {
    this.messageService.add(`${message}`)
  }


}
