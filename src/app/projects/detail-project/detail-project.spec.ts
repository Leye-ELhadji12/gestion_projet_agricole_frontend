import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailProject } from './detail-project';

describe('DetailProject', () => {
  let component: DetailProject;
  let fixture: ComponentFixture<DetailProject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailProject]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailProject);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
