import { Component, OnInit }              from '@angular/core';
import { ActivatedRoute, Params, Router }					from '@angular/router';
import { Location }												from '@angular/common';
import { Observable }											from 'rxjs/Observable';
import { NgbTypeaheadConfig, NgbModal }   from '@ng-bootstrap/ng-bootstrap';
import * as _ from "lodash";

import { Transaksi }						from '../transaksi/transaksi';
import { TransaksiService }			from '../transaksi/transaksi.service';

import { RekamMedis }           from '../pasien/rekam-medis';
import { RekamMedisService }    from '../pasien/rekam-medis.service';
import { HasilPemeriksaan }     from './hasil-pemeriksaan';
import { AntrianService }       from '../antrian/antrian.service';

import { PemakaianKamar }						from './pemakaian-kamar';
import { PemakaianKamarService }		from './pemakaian-kamar.service';

import { TenagaMedis }		from '../tenaga-medis/tenaga-medis';
import { TenagaMedisService }		from '../tenaga-medis/tenaga-medis.service';
import { Dokter }		from '../tenaga-medis/dokter';

import { Diagnosis }            from './diagnosis';
import { DiagnosisReference }		from './diagnosis-reference';
import { DiagnosisService }			from './diagnosis.service';

import { Tindakan }							from './tindakan';
import { TindakanReference }		from './tindakan-reference';
import { TindakanService }			from './tindakan.service';

import { ObatTindakan }         from '../farmasi/obat-tindakan/obat-tindakan';
import { ObatTindakanService }  from '../farmasi/obat-tindakan/obat-tindakan.service';

import { Resep }                from '../farmasi/resep/resep';
import { ResepItem }            from '../farmasi/resep/resep-item';
import { RacikanItem }          from '../farmasi/resep/racikan-item';
import { ResepService }         from '../farmasi/resep/resep.service';

import { JenisObat }            from '../farmasi/jenis-obat/jenis-obat';
import { JenisObatService }     from '../farmasi/jenis-obat/jenis-obat.service';

import { StokObat }	            from '../farmasi/stok-obat/stok-obat';
import { StokObatService }		  from '../farmasi/stok-obat/stok-obat.service';

import { ObatMasuk }	          from '../farmasi/obat-masuk/obat-masuk';
import { ObatMasukService }		  from '../farmasi/obat-masuk/obat-masuk.service';

@Component({
 	selector: 'pemeriksaan-rawat-inap-page',
 	templateUrl: './rawatinap-pemeriksaan.component.html',
 	providers: [
    AntrianService,
    PemakaianKamarService,
    RekamMedisService,
    TenagaMedisService,
 		TransaksiService,
 		DiagnosisService,
 		TindakanService,
    ObatTindakanService,
    ResepService,
    JenisObatService,
    StokObatService,
    ObatMasukService,
 		NgbTypeaheadConfig
	]
})

export class PemeriksaanRawatinapComponent implements OnInit {
	transaksi: any = null;
  rekamMedis: RekamMedis = null;
  hasilPemeriksaan: HasilPemeriksaan = new HasilPemeriksaan();
  keluhan: string;
  allRiwayat: any[] = [];
  allRiwayatLama: any;
  anamnesis: any;
  allPenyakit: any;
  allAlergi: any[] = [];
  allPerkembanganPasien: any[] = [];
  allTanggalPerkembangan: any[] = [];
  allRiwayatPenyakit: any;
  allAlergiLama: any;
  pelayananLain: string[] = [];
  riwayatBaru: string;
  alergiBaru: string;
  riwayatEmpty: boolean = false;
  alergiEmpty: boolean = false;
  perkembanganPasienBaru: string;
  tanggalPerkembanganBaru: string;
  pelayananBaru: string;
  rencana: any = {};
  rujuk: boolean = false;
  firstRekamMedis: boolean = false;
  namaPoliRujuk: string = null;

	allDiagnosisReference: DiagnosisReference[];
	allTindakanReference: TindakanReference[];
  allStokObatAtLocation: StokObat[];
  allJenisObat: JenisObat[];
  allDokter: Dokter[];
  allJasaDokter: any[];

  pemakaianKamar : PemakaianKamar;

  selectedDiagnosis: Diagnosis[] = [];
  selectedDiagnosisReference: DiagnosisReference[] = [];

  selectedTindakan: Tindakan[] = [];
  selectedTindakanReference: TindakanReference[] = [];

  perkiraan_waktu_keluar: string = null;
  perkembangan_pasien: string = null;

  resepItemModal: ResepItem = null;
  allResep: Resep[] = [];

  noPegawai:string;

	inputFormatter = (value : any) => value.nama;
	resultFormatter = (value : any) => value.kode + ' - ' + value.nama;

  inputObatFormatter = (value : StokObat) => value.jenis_obat.merek_obat;
  resultObatFormatter = (value: StokObat)	=> value.jenis_obat.merek_obat  + ' - ' + value.nomor_batch;

  inputJenisObatFormatter = (value : JenisObat) => value.merek_obat;
  resultJenisObatFormatter = (value: JenisObat)	=> value.merek_obat;

  inputDokterFormatter = (value : Dokter) => value.tenaga_medis.nama;
	resultDokterFormatter = (value: Dokter)	=> value.tenaga_medis.nama + ' - ' + value.spesialis + ' - ' + value.no_pegawai;

	searchTindakan = (text$: Observable<string>) =>
		text$
			.debounceTime(200)
			.distinctUntilChanged()
			.map(term => term.length < 2 ? []
				: this.allTindakanReference.filter(tindakanReference => tindakanReference.nama.toLowerCase().indexOf(term.toLowerCase()) > -1));

	searchDiagnosis = (text$: Observable<string>) =>
		text$
			.debounceTime(200)
			.distinctUntilChanged()
			.map(term => term.length < 2 ? []
				: this.allDiagnosisReference.filter(diagnosisReference => diagnosisReference.nama.toLowerCase().indexOf(term.toLowerCase()) > -1));

  searchStokObat = (text$: Observable<string>) =>
		text$
			.debounceTime(200)
			.distinctUntilChanged()
			.map(term => term.length < 2 ? []
				: this.allStokObatAtLocation.filter(stokObat => stokObat.jenis_obat.merek_obat.toLowerCase().indexOf(term.toLowerCase()) > -1));

  searchJenisObat = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 2 ? []
        : this.allJenisObat.filter(jenisObat => jenisObat.merek_obat.toLowerCase().indexOf(term.toLowerCase()) > -1));

  searchNamaDokter = (text$: Observable<string>) =>
		text$
			.debounceTime(200)
			.distinctUntilChanged()
			.map(term => term.length < 2 ? []
        : this.allDokter.filter(dokter => dokter.tenaga_medis.nama.toLowerCase().indexOf(term.toLowerCase()) > -1));
        
	constructor(
		private route: ActivatedRoute,
    private router: Router,
		private location: Location,
    private antrianService: AntrianService,
		private transaksiService: TransaksiService,
    private rekamMedisService: RekamMedisService,
		private pemakaianKamarService: PemakaianKamarService,
    private tenagaMedisService: TenagaMedisService,
		private diagnosisService: DiagnosisService,
		private tindakanService: TindakanService,
    private obatTindakanService: ObatTindakanService,
    private resepService: ResepService,
    private jenisObatService: JenisObatService,
    private obatMasukService: ObatMasukService,
    private stokObatService: StokObatService,
		private config: NgbTypeaheadConfig,
    private modalService: NgbModal
	) {
		config.editable = false;
	}

	ngOnInit() {
    this.noPegawai = JSON.parse(localStorage.getItem('currentUser')).no_pegawai;

    this.route.params
			.switchMap((params: Params) => this.pemakaianKamarService.getPemakaianKamar(params['idPemakaian']))
			.subscribe(
          data => {
            this.pemakaianKamar = data;
            this.pemakaianKamarService.getJasaDokterRawatinapById(this.pemakaianKamar.id).subscribe(
              data => { this.allJasaDokter = data}
            )
            this.stokObatService.getStokObatByLocationType(3).subscribe(
              allStokObatAtLocation => this.allStokObatAtLocation = allStokObatAtLocation
            );
        }
      );
	
		this.route.params
			.switchMap((params: Params) => this.transaksiService.getTransaksi(params['idTransaksi']))
			.subscribe(transaksi => {
        this.transaksi = transaksi;
        this.checkRekamMedis();
    });

    this.tenagaMedisService.getAllDokter().
      subscribe(data => this.allDokter = data);
      
		this.tindakanService.getAllTindakanReference().subscribe(
      data => { this.allTindakanReference = data }
    );

		this.diagnosisService.getAllDiagnosisReference().subscribe(
      data => { this.allDiagnosisReference = data }
    )

    this.jenisObatService.getAllJenisObat().subscribe(
      data => { this.allJenisObat = data }
    )

    
	}

  checkRekamMedis() {
    this.rekamMedisService.getRekamMedisOfPasien(this.transaksi.transaksi.id_pasien, 0).subscribe(
      data => {
        if (data != null) {
          if (data.tanggal_waktu == this.transaksi.transaksi.waktu_masuk_pasien) {
            this.rekamMedis = data;
            if (JSON.parse(data.hasil_pemeriksaan) != null)
              this.hasilPemeriksaan = JSON.parse(data.hasil_pemeriksaan);

            if (JSON.parse(data.anamnesis) != null) {
              this.keluhan = JSON.parse(data.anamnesis).keluhan;
              this.allAlergi = JSON.parse(data.anamnesis).alergi.split(',');
              this.allRiwayat = JSON.parse(data.anamnesis).riwayat_penyakit.split(',');
            }

            if(JSON.parse(data.perkembangan_pasien) != null) {
              this.allPerkembanganPasien = JSON.parse(data.perkembangan_pasien).perkembangan.split(',');
              this.allTanggalPerkembangan = JSON.parse(data.perkembangan_pasien).tanggal.split(',');
            }
          }
          
        }

        if (this.rekamMedis == null) {
          this.rekamMedis = new RekamMedis(
            this.transaksi.transaksi.id_pasien,
            this.transaksi.transaksi.waktu_masuk_pasien,
            JSON.parse(localStorage.getItem('currentUser')).no_pegawai,
            '',
            '',
            '',
            ''
          );

          this.rekamMedisService.createRekamMedis(this.rekamMedis).subscribe(
            data => { this.firstRekamMedis = true; }
          );
        }
      }
    )
    this.rekamMedisService.getAllRekamMedisOfPasien(this.transaksi.transaksi.id_pasien)
            .subscribe(allRekamMedis => {
              let allAnamnesis: any[] = [];
              for (let rekamMedis of allRekamMedis) {
                let anamnesis: any = JSON.parse(rekamMedis.anamnesis);
                allAnamnesis.push(anamnesis);
              }
              let allAlergi: any[] = [];
              let allRiwayat: any[] = [];
              for (let anamnesis of allAnamnesis) {
                if (anamnesis) {
                  if (_.includes(anamnesis.alergi, ',')) {
                    let moreAlergi: any[] = anamnesis.alergi.split(',');
                    allAlergi = allAlergi.concat(moreAlergi);
                  } else if (anamnesis.alergi != '') {
                    allAlergi.push(anamnesis.alergi);
                  }

                  if (_.includes(anamnesis.riwayat_penyakit, ',')) {
                    let moreRiwayat: any[] = anamnesis.riwayat_penyakit.split(',');
                    allRiwayat = allRiwayat.concat(moreRiwayat);
                  } else if (anamnesis.riwayat_penyakit != '') {
                    allRiwayat.push(anamnesis.riwayat_penyakit);
                  }
                }
              }
              this.allAlergiLama = _.uniq(allAlergi, true);
              if (_.isEmpty(this.allAlergiLama)) {
                this.allAlergiLama = ['Tidak ada alergi yang tercatat'];
                this.alergiEmpty = true;
              }
              this.allRiwayatPenyakit =  _.uniq(allRiwayat, true);
              if (_.isEmpty(this.allRiwayatPenyakit)) {
                this.allRiwayatPenyakit = ['Tidak ada penyakit yang tercatat'];
                this.riwayatEmpty = true;
              } 
            });
  }

  loadRiwayat(): void {
    this.diagnosisService.getDiagnosisOfPasien(this.transaksi.transaksi.id_pasien)
      .subscribe(data => {
        let allTanggalDiagnosis: any[] =  _.uniqBy(data, 'tanggal_waktu');
        this.allRiwayatLama = [];
        for (let tanggalDiagnosis of allTanggalDiagnosis) {
          let json: any = { tanggal_waktu: tanggalDiagnosis.tanggal_waktu };
          let allDiagnosis: any = _.filter(data, {'tanggal_waktu': tanggalDiagnosis.tanggal_waktu});
          json.allDiagnosis = allDiagnosis;
          this.allRiwayatLama.push(json);
        }
      });
  }

	addSelectedDiagnosis(diagnosisReference: DiagnosisReference) {
		this.selectedDiagnosisReference.push(diagnosisReference);

    let temp = new Diagnosis();
    temp.id_pasien = this.transaksi.transaksi.id_pasien;
    temp.tanggal_waktu = this.rekamMedis.tanggal_waktu;
    temp.kode_diagnosis = diagnosisReference.kode;
    this.selectedDiagnosis.push(temp);
	}

	removeSelectedDiagnosis(i: number) {
		this.selectedDiagnosis.splice(i, 1);
    this.selectedDiagnosisReference.splice(i, 1);
	}

	addSelectedTindakan(tindakanReference: TindakanReference) {
    this.selectedTindakanReference.push(tindakanReference);

    let temp = new Tindakan();
    temp.id_transaksi = this.transaksi.transaksi.id;
    temp.harga = tindakanReference.harga;
    temp.keterangan = '';
    temp.id_pembayaran = null;
    temp.kode_tindakan = tindakanReference.kode;
    temp.id_pasien = this.transaksi.transaksi.id_pasien;
    temp.tanggal_waktu = this.rekamMedis.tanggal_waktu;
    temp.np_tenaga_medis = JSON.parse(localStorage.getItem('currentUser')).no_pegawai;
    temp.nama_poli = null;
    temp.nama_lab = null;
    temp.nama_ambulans = null;
    this.selectedTindakan.push(temp);
  }
  
	removeSelectedTindakan(i: number) {
		this.selectedTindakan.splice(i, 1);
    this.selectedTindakanReference.splice(i, 1);
  }
  
  addDokter(dokter:Dokter) {
    this.pemakaianKamarService.createJasaDokterRawatinap(dokter, this.pemakaianKamar.id).subscribe(
          data => { 
            this.pemakaianKamarService.getJasaDokterRawatinapById(this.pemakaianKamar.id).subscribe(
              data => { this.allJasaDokter = data}
            )
          }
    )
  }

  addSelectedStokObat(obatTindakan: ObatTindakan, stokObat: StokObat) {
    obatTindakan.stok_obat = stokObat;
    obatTindakan.id_jenis_obat = stokObat.id_jenis_obat;
    obatTindakan.id_stok_obat = stokObat.id;
  }

  addObatTindakanForm(tindakan: Tindakan) {
    let obatTindakan = new ObatTindakan();
    obatTindakan.id_transaksi = this.transaksi.transaksi.id;
    obatTindakan.asal = 3;
    tindakan.obat_tindakan.push(obatTindakan);
  }

  removeObatTindakanForm(i: number, tindakan: Tindakan) {
    tindakan.obat_tindakan.splice(i, 1);
  }

  addResep() {
    let resep = new Resep();
    resep.id_transaksi = this.transaksi.transaksi.id;
    this.allResep.push(resep);
  }

  removeResep(i: number) {
    this.allResep.splice(i, 1);
  }

  createResepItem() {
    this.resepItemModal = new ResepItem();
  }

  editResepItem(resepItem: ResepItem) {
    this.resepItemModal = Object.assign({}, resepItem);
  }

  addResepItem(resep: Resep) {
    resep.resep_item.push(this.resepItemModal);
  }

  removeResepItem(i: number, resep: Resep) {
    resep.resep_item.splice(i, 1);
  }

  addRacikanItem(resepItem: ResepItem) {
    let racikanItem = new RacikanItem();
    resepItem.racikan_item.push(racikanItem);
  }

  removeRacikanItem(i: number, resepItem: ResepItem) {
    resepItem.racikan_item.splice(i, 1);
  }

  addSelectedJenisObat(racikanItem: RacikanItem, jenisObat: JenisObat) {
    racikanItem.id_jenis_obat = jenisObat.id;
    racikanItem.jenis_obat = jenisObat;
  }

  addRiwayat() {
    this.allRiwayat.push(this.riwayatBaru);
    this.riwayatBaru = '';
  }

  removeRiwayat(i: number) {
    this.allRiwayat.splice(i, 1);
  }

  addAlergi() {
    this.allAlergi.push(this.alergiBaru);
    this.alergiBaru = '';
  }

  addPerkembanganPasien() {
    this.allPerkembanganPasien.push(this.perkembanganPasienBaru);
    this.perkembanganPasienBaru = '';
  }

  addTanggalPerkembangan() {
    this.allTanggalPerkembangan.push(new Date().toISOString().slice(0, 10));
    this.tanggalPerkembanganBaru = '';
  }

  removeAlergi(i: number) {
    this.allAlergi.splice(i, 1);
  }

  addPelayanan() {
    this.pelayananLain.push(this.pelayananBaru);
    this.pelayananBaru = '';
  }

  removePelayanan(i: number) {
    this.pelayananLain.splice(i, 1);
  }

  goBack(): void {
    this.location.back();
  }

  saveObatTindakan(data: Tindakan[]) {
    let observables = [];
    let i = 0;

    for (let tindakan of this.selectedTindakan) {
      for (let obatTindakan of tindakan.obat_tindakan) {
        obatTindakan.id_tindakan = data[i].id;
      }
      observables.push(
        this.obatTindakanService.createObatTindakan(tindakan.obat_tindakan)
      )
      i++;
    }

    if (this.rujuk) {
      let antrian: any = {};
      antrian.id_transaksi = this.transaksi.transaksi.id;
      antrian.nama_layanan_poli = this.namaPoliRujuk;
      antrian.kesempatan = 3;
      observables.push(this.antrianService.createAntrian(antrian));
    }

    Observable.forkJoin(observables).subscribe(
      data => {
        this.saveResep();
      }
    )
  }

  saveResep() {
    this.resepService.createResep(this.allResep).subscribe(
      data => {
        this.router.navigate(['']);
      }
    )
  }

  deleteJasaDokter(id:number) {
    this.pemakaianKamarService.deleteJasaDokterRawatinap(id).subscribe(
      data=> { 
        this.pemakaianKamarService.getJasaDokterRawatinapById(this.pemakaianKamar.id).subscribe(
          data => { this.allJasaDokter = data}
        ) 
      }
    )
  }

	save() {
    let anamnesis: any = {
      keluhan: this.keluhan,
      riwayat_penyakit: this.allRiwayat.toString(),
      alergi: this.allAlergi.toString()
    };

    this.addPerkembanganPasien();
    this.addTanggalPerkembangan();

    let perkembangan_pasien: any = {
      perkembangan: this.allPerkembanganPasien.toString(),
      tanggal: this.allTanggalPerkembangan.toString()
    }

    if(this.perkiraan_waktu_keluar != null) {
      this.pemakaianKamar.perkiraan_waktu_keluar = this.perkiraan_waktu_keluar;
      this.pemakaianKamarService.perbaruiWaktuKeluarPemakaianKamar(this.pemakaianKamar.id, this.pemakaianKamar).subscribe(
          data => {}
      )
    }

    this.rekamMedis.perkembangan_pasien = JSON.stringify(perkembangan_pasien);
    this.rekamMedis.hasil_pemeriksaan = JSON.stringify(this.hasilPemeriksaan);
    this.rekamMedis.anamnesis = JSON.stringify(anamnesis);
    this.rekamMedis.rencana_penatalaksanaan = JSON.stringify(this.rencana);
    this.rekamMedis.pelayanan_lain = JSON.stringify(this.pelayananLain);
    this.rekamMedisService.updateRekamMedis(this.rekamMedis).subscribe(
      data1 => {
        if (this.selectedDiagnosis.length > 0) {
          this.diagnosisService.saveDiagnosis(this.selectedDiagnosis).subscribe(
            data2 => {
              this.tindakanService.saveTindakan(this.selectedTindakan).subscribe(
                data3 => {
                  this.saveObatTindakan(data3);
                }
              );
            }
          );
        }
        else {
          this.tindakanService.saveTindakan(this.selectedTindakan).subscribe(
            data3 => {
              this.saveObatTindakan(data3);
            }
          );
        }
      }
    )
	}
}
