import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SiteThemeService } from 'tanam-core';

@Component({
  selector: 'app-theme-overview',
  templateUrl: './theme-overview.component.html',
  styleUrls: ['./theme-overview.component.scss']
})
export class ThemeOverviewComponent implements OnInit {
  readonly createTypeForm: FormGroup = this.formBuilder.group({
    title: [null, [Validators.required]],
  });

  constructor(
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly themeService: SiteThemeService,
  ) { }

  ngOnInit() {
  }

  createNewType() {
    this.themeService.create().then(id => {
      this.router.navigateByUrl(`/_/admin/themes/${id}`);
    });
  }
}