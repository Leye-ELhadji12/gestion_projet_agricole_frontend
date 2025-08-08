import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailActivity } from './detail-activity';

describe('DetailActivity', () => {
  let component: DetailActivity;
  let fixture: ComponentFixture<DetailActivity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailActivity]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailActivity);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
