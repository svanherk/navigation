import 'd2l-colors/d2l-colors.js';
import './d2l-navigation-shared-styles';

import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import { navigationSharedStyle } from './d2l-navigation-shared-styles';
/**
`d2l-navigation-band`
Polymer-based web component for a solid colour band that runs along the top of the navigational header

@demo demo/navigation-band.html
*/
class D2LNavigationBand extends PolymerElement {

	static get properties() {
		return {
			customScroll: {
				type: Boolean,
				readOnly: true,
				value: function() {
					const userAgent = navigator.userAgent.toLowerCase();
					return (userAgent.indexOf('win') > -1 && userAgent.indexOf('mobile') === -1);
				}
			}
		};
	}
	static get template() {
		const template = html`
		${navigationSharedStyle}
		<style>
			:host {
				background: linear-gradient(180deg, var(--d2l-branding-primary-color, var(--d2l-color-celestine)) var(--d2l-navigation-band-slot-height, 1.5rem), #ffffff 0%);
				display: block;
				min-height: 4px;
			}

			.d2l-navigation-scroll {
				overflow-x: auto;
				overflow-y: hidden;
			}

			.d2l-navigation-scroll[custom-scroll] {
				/* Firefox Styles */
				scrollbar-color: var(--d2l-color-galena) var(--d2l-color-sylvite);
				scrollbar-width: thin;

				/* IE Styles */
				scrollbar-face-color: var(--d2l-color-galena);
				scrollbar-arrow-color: var(--d2l-color-sylvite);
				scrollbar-track-color: var(--d2l-color-sylvite);
				scrollbar-shadow-color: var(--d2l-color-sylvite);
			}
			/* Webkit Styles */
			.d2l-navigation-scroll[custom-scroll]::-webkit-scrollbar {
				border-radius: 8px;
				background-color: var(--d2l-color-sylvite);
				height: 9px;
			}
			.d2l-navigation-scroll[custom-scroll]::-webkit-scrollbar-thumb {
				background-color: var(--d2l-color-galena);
				border-radius: 8px;
				border-bottom: 1px solid var(--d2l-color-sylvite);
				border-top: 1px solid var(--d2l-color-sylvite);
			}
			/* Faded edges styles */
			.d2l-navigation-scroll[custom-scroll]:before,
			.d2l-navigation-scroll[custom-scroll]:after {
				content: '';
				position: absolute;
				height: 100%;
				max-height: var(--d2l-navigation-band-slot-height, 1.5rem);
				top: 0;
				z-index: 2;
			}
			.d2l-navigation-scroll[custom-scroll]:before {
				left: 0;
				background: linear-gradient(to right, var(--d2l-branding-primary-color, var(--d2l-color-celestine)), transparent);
			}
			.d2l-navigation-scroll[custom-scroll]:after {
				right: 0;
				background: linear-gradient(to left, var(--d2l-branding-primary-color, var(--d2l-color-celestine)), transparent);
			}
			/* Styles to ensure the right padding is respected when scrolling */
			.d2l-navigation-centerer {
				line-height: 0;
				position: relative;
			}
			.d2l-navigation-gutters {
				display: inline-block;
				vertical-align: top;
			}
		</style>
		<div class="d2l-navigation-centerer">
			<div class="d2l-navigation-scroll" custom-scroll$=[[customScroll]]>
				<div class="d2l-navigation-gutters">
					<slot></slot>
				</div>
			</div>
		</div>
		`;
		template.setAttribute('strip-whitespace', '');
		return template;
	}
}
customElements.define('d2l-navigation-band', D2LNavigationBand);
