import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxHeroicons } from './ngx-heroicons';

describe('NgxHeroicons', () => {
  let component: NgxHeroicons;
  let fixture: ComponentFixture<NgxHeroicons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxHeroicons],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxHeroicons);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
