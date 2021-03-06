/* tslint:disable:no-unused-variable */
import * as path from 'path';
import { ComicDownloaderModule } from '../comic-downloader.module';
import { ElectronService } from './../../shared/services/electron.service';
import { ComicImageDownloadStatus } from './../../shared/enums/comic-image-download-status.enum';
import { ComicDownloaderService } from './../comic-downloader.service';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ComicDownloadListComponent } from './comic-download-list.component';

describe('ComicDownloadListComponent', () => {
  let component: ComicDownloadListComponent;
  let fixture: ComponentFixture<ComicDownloadListComponent>;
  let service: ComicDownloaderService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ComicDownloaderModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComicDownloadListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    service = TestBed.get(ComicDownloaderService);
  });

  it('should binding service.toDownloadComicImageList', fakeAsync(() => {
    service.toDownloadComicImageList = [
      {
        savedPath: `TestComic${path.sep}0003${path.sep}image01.jpg`,
        imageUrl: 'http://comic/0003/image01.jpg',
        status: ComicImageDownloadStatus.Ready
      },
      {
        savedPath: `TestComic${path.sep}0003${path.sep}image02.jpg`,
        imageUrl: 'http://comic/0003/image02.jpg',
        status: ComicImageDownloadStatus.Error
      },
      {
        savedPath: `TestComic${path.sep}0004${path.sep}image01.jpg`,
        imageUrl: 'http://comic/0004/image01.jpg',
        status: ComicImageDownloadStatus.Finish
      },
      {
        savedPath: `TestComic${path.sep}0004${path.sep}image02.jpg`,
        imageUrl: 'http://comic/0004/image02.jpg',
        status: ComicImageDownloadStatus.Downloading
      },
      {
        savedPath: `TestComic${path.sep}0004${path.sep}image03.jpg`,
        imageUrl: 'http://comic/0004/image03.jpg',
        status: ComicImageDownloadStatus.Exist
      },
    ];
    fixture.detectChanges();
    const imageList = fixture.debugElement.queryAll(By.css('#imageList > tbody > tr'));

    expect(service.toDownloadComicImageList.length).toBe(imageList.length);

    expect((imageList[0].queryAll(By.css('td'))[0].nativeElement).textContent.trim()).toBe('未下載');

    expect((imageList[1].queryAll(By.css('td'))[0].nativeElement).textContent.trim()).toBe('錯誤');
    expect((imageList[1].queryAll(By.css('td'))[0].nativeElement).classList).toContain('text-danger');
    expect((imageList[1].queryAll(By.css('td'))[0].query(By.css('i')).nativeElement).classList).toContain('fa-warning');

    expect((imageList[2].queryAll(By.css('td'))[0].nativeElement).textContent.trim()).toBe('完成');
    expect((imageList[2].queryAll(By.css('td'))[0].nativeElement).classList).toContain('text-success');
    expect((imageList[2].queryAll(By.css('td'))[0].query(By.css('i')).nativeElement).classList).toContain('fa-check');

    expect((imageList[3].queryAll(By.css('td'))[0].nativeElement).textContent.trim()).toBe('下載中');
    expect((imageList[3].queryAll(By.css('td'))[0].nativeElement).classList).toContain('text-info');
    expect((imageList[3].queryAll(By.css('td'))[0].query(By.css('i')).nativeElement).classList).toContain('fa-spin');
    expect((imageList[3].queryAll(By.css('td'))[0].query(By.css('i')).nativeElement).classList).toContain('fa-spinner');

    expect((imageList[4].queryAll(By.css('td'))[0].nativeElement).textContent.trim()).toBe('已存在');
    expect((imageList[4].queryAll(By.css('td'))[0].nativeElement).classList).toContain('text-danger');
    expect((imageList[4].queryAll(By.css('td'))[0].query(By.css('i')).nativeElement).classList).toContain('fa-copy');

    expect((imageList[0].queryAll(By.css('td'))[1].nativeElement).textContent).toBe(`TestComic${path.sep}0003${path.sep}image01.jpg`);
    expect((imageList[0].queryAll(By.css('td'))[2].nativeElement).textContent).toBe('http://comic/0003/image01.jpg');

    expect((imageList[4].queryAll(By.css('td'))[1].nativeElement).textContent).toBe(`TestComic${path.sep}0004${path.sep}image03.jpg`);
    expect((imageList[4].queryAll(By.css('td'))[2].nativeElement).textContent).toBe(`http://comic/0004/image03.jpg`);
  }));

  describe('skip if exist', () => {
    it('should bind component.skipIfExist', () => {
      component.skipIfExist = true;
      fixture.detectChanges();

      fixture.debugElement.query(By.css('#skipIfExist')).triggerEventHandler('click', null);
      fixture.detectChanges();

      expect(component.skipIfExist).toBeFalsy();

      fixture.debugElement.query(By.css('#skipIfExist')).triggerEventHandler('click', null);
      fixture.detectChanges();

      expect(component.skipIfExist).toBeTruthy();
    });
  });

  describe('clear download image list', () => {
    it('should call service.toDownloadList', () => {
      spyOn(service, 'clearToDownloadImageList');
      fixture.debugElement.query(By.css('#clearPictureUrls')).triggerEventHandler('click', null);

      expect(service.clearToDownloadImageList).toHaveBeenCalled();
    });
  });

  describe('one click download', () => {
    it('should call component.oneClickDownload when press button', () => {
      spyOn(component, 'oneClickDownload');

      fixture.debugElement.query(By.css('#oneKeyDownload')).triggerEventHandler('click', null);

      expect(component.oneClickDownload).toHaveBeenCalled();
    });

    it('should get all comic images then start download', fakeAsync(() => {
      component.getLastVols = 5;

      service.appSettings = {
        comicList: [{
          name: 'comic name1',
          url: 'http://comic/1'
        }, {
          name: 'comic name2',
          url: 'http://comic/2'
        }, {
          name: 'comic name3',
          url: 'http://comic/3'
        }]
      };

      const expectedOrder = [];
      spyOn(service, 'getImageList').and.callFake((url, vols) => {
        expectedOrder.push(url);
        return new Promise((resolve) => { resolve(); });
      });

      spyOn(component, 'startDownload').and.callFake(() => {
        expectedOrder.push('start');
      });

      component.oneClickDownload();
      tick();

      expect(service.getImageList).toHaveBeenCalledWith('http://comic/1', 5);
      expect(service.getImageList).toHaveBeenCalledWith('http://comic/2', 5);
      expect(service.getImageList).toHaveBeenCalledWith('http://comic/3', 5);
      expect(service.getImageList).toHaveBeenCalledTimes(3);
      expect(component.startDownload).toHaveBeenCalled();
      expect(expectedOrder).toEqual(['http://comic/1', 'http://comic/2', 'http://comic/3', 'start']);
    }));
  });

  describe('start download', () => {
    beforeEach(() => {
      spyOn(service, 'startDownload').and.returnValue(new Promise((resolve) => {
        resolve();
      }));

      service.toDownloadComicImageList = [{
        savedPath: `TestComic${path.sep}0004${path.sep}image03.jpg`,
        imageUrl: 'http://comic/0004/image03.jpg',
        status: ComicImageDownloadStatus.Exist
      }];

      spyOn(window, 'alert');
    });

    it('should call service.startDownload()', () => {
      component.skipIfExist = false;
      component.startDownload();
      expect(service.startDownload).toHaveBeenCalledWith(component.skipIfExist);
    });

    it('should call service.startDownload() only if comic image list is not empty', () => {
      service.toDownloadComicImageList = [];
      component.startDownload();

      expect(service.startDownload).toHaveBeenCalledTimes(0);
    });

    it('should alert after download complete', fakeAsync(() => {
      component.startDownload();
      expect(component.downloading).toBeTruthy();

      tick();

      expect(window.alert).toHaveBeenCalledWith('全部下載完成');
      expect(component.downloading).toBeFalsy();
    }));

    it('should disabled button when downloading', () => {
      const oneKeyDownloadButton = fixture.debugElement.query(By.css('#oneKeyDownload')).nativeElement;
      const clearPictureUrlsButton = fixture.debugElement.query(By.css('#clearPictureUrls')).nativeElement;
      const startDownloadButton = fixture.debugElement.query(By.css('#startDownload')).nativeElement;
      const skipIfExistCheckbox = fixture.debugElement.query(By.css('#skipIfExist')).nativeElement;

      component.downloading = true;
      fixture.detectChanges();
      expect(oneKeyDownloadButton.disabled).toBeTruthy();
      expect(clearPictureUrlsButton.disabled).toBeTruthy();
      expect(startDownloadButton.disabled).toBeTruthy();
      expect(skipIfExistCheckbox.disabled).toBeTruthy();

      component.downloading = false;
      fixture.detectChanges();
      expect(oneKeyDownloadButton.disabled).toBeFalsy();
      expect(clearPictureUrlsButton.disabled).toBeFalsy();
      expect(startDownloadButton.disabled).toBeFalsy();
      expect(skipIfExistCheckbox.disabled).toBeFalsy();
    });
  });

});
