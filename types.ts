/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface Project {
  id: string;
  name: string;
  type: string;
  url: string;
  description: string;
  image: string;
}

export interface ServiceOption {
  title: string;
  priceDesc: string;
  features: string[];
  recommended?: boolean;
}

export type ViewState = 'home' | 'services' | 'contact';
