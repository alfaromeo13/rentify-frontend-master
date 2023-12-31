import { Injectable } from "@angular/core";
import { BehaviorSubject, filter, map, take } from "rxjs";
import { environment } from "src/environments/environment";
import { Client } from '@stomp/stompjs';
import * as SockJS from "sockjs-client";
// import { WINDOW } from '@app/core/providers/window.provider';

@Injectable({
    providedIn: 'root'
})
export class CoreSocketService {
    /* ova klasa samo otvara soket i sadrzi neke metode kao za parsiranje odgovora jer
      cemo neke podatke primati kroz soket.Ti podaci su u cistom JSON stringu i moraju se
      parsirati da bi se dobio neki objekat za to nam sluzi metoda standardParse(data: any) 
      koja od data sto je JSON string pravi objekat sa JSON.parse().
      Takodje imamo metodu stringify() koja sluzi za slanje podataka jer kada saljemo podatke
      ne mozemo ih slati u JSON formatu vec moramo kao JSON string tj neki json samo '{name:...}'
    */
    static connected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    private _stompClient: Client;
    private authHeader: any;
    private userHeader: any;

    static standardParse(data: any) {
        try {
            console.log('Received data: ', data);
            return JSON.parse(data.body);
        } catch (e) {
            console.log('error JSON parsing data.body');
            return {};
        }
    }

    static stringify(data: any) {
        try {
            return JSON.stringify(data);
            //this method doesn't return json instead it returns json as a string 
            //like this  {} =>  '{}' // application/json ~ it sends plain text
        } catch (e) {
            console.log('Could not stringify object');
            return '';
        }
    }

    private get url() {
        return `http://localhost:8080/websocket/subscribe`; // ovdje ide ruta za CONNECT
    }

    static onConnect(callback: any) {
        if (callback) {
            callback();
        }
        CoreSocketService.connected.next(true);
    }

    static onStompError() {
        console.log('error');
    }

    getClient = () => this._stompClient;

    //ovo nam otvara soket konekciju ka definisanom url()-u na bekendu
    //(tj na STOMP endpoint u konfiguracionoj klasi) 
    initConnection(callback?: () => void) {
        this._stompClient = new Client({
            webSocketFactory: () => {
                console.log(this.url);
                return new SockJS(this.url);
            },
            debug: function (str: any) {
                if (environment.production) {
                    console.log(str);
                }
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        //ovo iznad ako dodje do neke greske pri konekciji radi reconnect automatski svakih 5 sekundi s

        this._stompClient.onConnect = CoreSocketService.onConnect.bind(this, callback);
        this._stompClient.onStompError = CoreSocketService.onStompError;
        this._stompClient.activate();
    }

    subscribe(url: string, callBack: (data?: any) => void) {
        return CoreSocketService.connected
            .pipe(
                filter((connectedSocket: any) => connectedSocket),
                take(1),
                map(() => this.getClient().subscribe(url, callBack))
            )
            .toPromise();
    }

    // ovdje je primjer kako se publish-uje poruka sa front-a na back
    sendMessageToConversation(destination: string, data: string) {
        this.getClient().publish({
            destination,
            body: data
        });
    }

    closeConnection() {
        if (this._stompClient) {
            CoreSocketService.connected.next(false);
            this._stompClient.deactivate();
        }
    }
}