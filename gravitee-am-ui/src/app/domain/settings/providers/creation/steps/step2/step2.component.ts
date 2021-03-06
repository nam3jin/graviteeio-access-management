/*
 * Copyright (C) 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {PlatformService} from "../../../../../../services/platform.service";
import {ProviderService} from "../../../../../../services/provider.service";
import {SnackbarService} from "../../../../../../services/snackbar.service";
import {ActivatedRoute, Router, RouterStateSnapshot} from "@angular/router";
import {AppConfig} from "../../../../../../../config/app.config";

@Component({
  selector: 'provider-creation-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.scss']
})
export class ProviderCreationStep2Component implements OnInit, OnChanges {
  @Input('provider') provider: any;
  configuration: any;
  configurationIsValid: boolean = false;
  providerSchema: any = {};
  private domainId: string;
  private adminContext: boolean;

  constructor(private platformService: PlatformService, private providerService: ProviderService,
              private snackbarService: SnackbarService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.domainId = this.route.snapshot.parent.parent.params['domainId'];
    if (this.router.routerState.snapshot.url.startsWith('/settings')) {
      this.domainId = AppConfig.settings.authentication.domainId;
      this.adminContext = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.provider) {
      this.platformService.identitySchema(changes.provider.currentValue.type).map(resp => resp.json()).subscribe(data => this.providerSchema = data);
    }
  }

  enableProviderCreation(configurationWrapper) {
    this.configurationIsValid = configurationWrapper.isValid;
    this.provider.configuration = configurationWrapper.configuration;
  }

  create() {
    this.provider.configuration = JSON.stringify(this.provider.configuration);
    this.providerService.create(this.domainId, this.provider).map(res => res.json()).subscribe(data => {
      this.snackbarService.open("Provider " + data.name + " created");
      if (this.adminContext) {
        this.router.navigate(['/settings', 'management', 'providers', data.id]);
      } else {
        this.router.navigate(['/domains', this.domainId, 'settings', 'providers', data.id]);
      }
    })
  }

  get isValid() {
    if (this.provider.name && this.configurationIsValid) {
      return true;
    } else {
      return false;
    }
  }
}
