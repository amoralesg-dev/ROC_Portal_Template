import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RassiniUi } from './rassini-ui';

describe('RassiniUi', () => {
  let component: RassiniUi;
  let fixture: ComponentFixture<RassiniUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RassiniUi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RassiniUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
