import { Injectable }			from '@angular/core';
import { Headers, Http, Response, RequestOptions }		from '@angular/http';
import { Observable }			from 'rxjs/Rx';
import { AuthHttp }				from 'angular2-jwt';

import { ENV }										from '../environment';
import { Transaksi }							from '../transaksi/transaksi';
import { Tindakan }								from './tindakan';
import { TindakanReference }			from './tindakan-reference';

@Injectable()
export class TindakanService {
	private tindakanReferenceUrl = ENV.tindakanReferenceUrl;
	private tindakanUrl = ENV.tindakanUrl;
	private tindakanOperasiUrl = ENV.tindakanOperasiUrl;

	tindakan: Tindakan;
	tindakanInstances: Tindakan[] = [];
	i: number;

	constructor(private http: Http,private authHttp: AuthHttp) { }

	private handleError(error: any): Promise<any> {
		console.error('An error occurred', error);
		return Promise.reject(error.message || error);
	}

	getTindakan(id: number) : Observable<Tindakan> {
		return this.http.get(this.tindakanOperasiUrl + '/id/' + id)
			.map((res: Response) => res.json());
	}

	getTindakanWithoutHasilLab(nama_lab: string): Observable<Tindakan[]> {
		return this.authHttp.get(this.tindakanUrl + '/hasil_lab/' + nama_lab)
			.map((res: Response) => res.json());
	}

	getTindakanWithoutAmbulans(): Observable<Tindakan[]> {
		return this.authHttp.get(this.tindakanUrl + '/no_ambulans')
			.map((res: Response) => res.json());
	}

	getTindakanOfRekamMedis(id_pasien: number, tanggal_waktu: string): Observable<Tindakan[]> {
		return this.authHttp.get(this.tindakanUrl + '/rekam_medis/' + id_pasien + '/' + tanggal_waktu)
			.map((res: Response) => res.json());
	}

	getTindakanOfLabByKodePasien(nama_lab: string, kode_pasien: string): Observable<Tindakan[]> {
		return this.authHttp.get(this.tindakanUrl + '/laboratorium/' + nama_lab + '/' + kode_pasien)
			.map((res: Response) => res.json());
	}

	updateTindakan(tindakan: Tindakan): Observable<Tindakan> {
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers: headers});
		let body = JSON.stringify(tindakan);
		return this.authHttp.put(this.tindakanUrl + '/' + tindakan.id, body, options)
			.map((res: Response) => res.json());
	}

	saveTindakan (selectedTindakan: Tindakan[]) {
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers: headers});
		let body = JSON.stringify(selectedTindakan);
		return this.authHttp.post(this.tindakanUrl, body, options)
			.map((res: Response) => res.json());
	}

	getAllTindakanReference(): Observable<TindakanReference[]> {
		return this.authHttp.get(this.tindakanReferenceUrl)
			.map((res: Response) => res.json());
	}

	getTindakanReference(kode: string): Observable<TindakanReference> {
		return this.authHttp.get(this.tindakanReferenceUrl + '/' + kode)
			.map((res: Response) => res.json());
	}

	createTindakanReference(tindakanReference: TindakanReference) {
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers: headers});
		let body = JSON.stringify(tindakanReference);
		return this.authHttp.post(this.tindakanReferenceUrl, body, options)
			.map((res: Response) => res.json());
	}

	updateTindakanReference(kode: string, tindakanReference: TindakanReference) {
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers: headers});
		let body = JSON.stringify(tindakanReference);
		return this.authHttp.put(this.tindakanReferenceUrl + '/' + kode, body, options)
			.map((res: Response) => res.json());
	}

	destroyTindakanReference(kode: string) {
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers: headers});
		return this.authHttp.delete(this.tindakanReferenceUrl + '/' + kode, options)
			.map((res: Response) => res.json());
	}
}
