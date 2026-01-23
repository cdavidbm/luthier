/**
 * LuthierTeam - Mostrar equipo/personal
 *
 * Componente para mostrar miembros de un equipo con foto, nombre, cargo y redes sociales.
 *
 * ATRIBUTOS:
 * - columnas : Número de columnas (default: 3)
 * - centrado : Centra las tarjetas si hay menos que columnas
 *
 * ESTRUCTURA REQUERIDA:
 * Los hijos deben tener data-nombre y opcionalmente otros atributos.
 *
 * @example Uso básico
 * <luthier-team columnas="4">
 *     <div data-nombre="Ana García"
 *          data-cargo="Directora"
 *          data-foto="img/ana.jpg"
 *          data-email="ana@ejemplo.com"
 *          data-linkedin="https://linkedin.com/in/ana">
 *         <p>Breve biografía de Ana.</p>
 *     </div>
 * </luthier-team>
 */
(function(global) {
    'use strict';

    class LuthierTeam extends HTMLElement {

        connectedCallback() {
            setTimeout(this._init.bind(this), 0);
        }

        _init() {
            this._config = {
                columnas: parseInt(this.getAttribute('columnas'), 10) || 3,
                centrado: this.hasAttribute('centrado')
            };

            var miembros = this._extraerMiembros();

            if (miembros.length === 0) {
                console.warn('LuthierTeam: No se encontraron miembros');
                return;
            }

            this._construirDOM(miembros);
        }

        _extraerMiembros() {
            var miembros = [];
            var hijos = this.children;

            for (var i = 0; i < hijos.length; i++) {
                var hijo = hijos[i];
                miembros.push({
                    nombre: hijo.getAttribute('data-nombre') || '',
                    cargo: hijo.getAttribute('data-cargo') || '',
                    foto: hijo.getAttribute('data-foto') || '',
                    email: hijo.getAttribute('data-email') || '',
                    linkedin: hijo.getAttribute('data-linkedin') || '',
                    twitter: hijo.getAttribute('data-twitter') || '',
                    github: hijo.getAttribute('data-github') || '',
                    bio: hijo.cloneNode(true)
                });
            }

            return miembros;
        }

        _construirDOM(miembros) {
            this.textContent = '';
            this.classList.add('team-wrapper');

            var grid = document.createElement('div');
            grid.className = 'team__grid';
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(' + this._config.columnas + ', 1fr)';
            grid.style.gap = '2rem';

            if (this._config.centrado) {
                grid.style.justifyContent = 'center';
            }

            for (var i = 0; i < miembros.length; i++) {
                var card = this._crearTarjeta(miembros[i]);
                grid.appendChild(card);
            }

            this.appendChild(grid);
        }

        _crearTarjeta(miembro) {
            var card = document.createElement('article');
            card.className = 'team__card';

            // Foto
            if (miembro.foto) {
                var fotoContainer = document.createElement('div');
                fotoContainer.className = 'team__foto-container';

                var foto = document.createElement('img');
                foto.src = miembro.foto;
                foto.alt = miembro.nombre;
                foto.className = 'team__foto';
                foto.setAttribute('loading', 'lazy');

                fotoContainer.appendChild(foto);
                card.appendChild(fotoContainer);
            }

            // Info
            var info = document.createElement('div');
            info.className = 'team__info';

            // Nombre
            if (miembro.nombre) {
                var nombre = document.createElement('h3');
                nombre.className = 'team__nombre';
                nombre.textContent = miembro.nombre;
                info.appendChild(nombre);
            }

            // Cargo
            if (miembro.cargo) {
                var cargo = document.createElement('p');
                cargo.className = 'team__cargo';
                cargo.textContent = miembro.cargo;
                info.appendChild(cargo);
            }

            // Bio
            var bio = document.createElement('div');
            bio.className = 'team__bio';
            while (miembro.bio.firstChild) {
                bio.appendChild(miembro.bio.firstChild);
            }
            if (bio.childNodes.length > 0) {
                info.appendChild(bio);
            }

            // Redes sociales
            var redes = document.createElement('div');
            redes.className = 'team__redes';

            if (miembro.email) {
                var emailLink = document.createElement('a');
                emailLink.href = 'mailto:' + miembro.email;
                emailLink.className = 'team__red team__red--email';
                emailLink.setAttribute('aria-label', 'Email de ' + miembro.nombre);
                emailLink.textContent = '✉';
                redes.appendChild(emailLink);
            }

            if (miembro.linkedin) {
                var linkedinLink = document.createElement('a');
                linkedinLink.href = miembro.linkedin;
                linkedinLink.className = 'team__red team__red--linkedin';
                linkedinLink.setAttribute('target', '_blank');
                linkedinLink.setAttribute('rel', 'noopener noreferrer');
                linkedinLink.setAttribute('aria-label', 'LinkedIn de ' + miembro.nombre);
                linkedinLink.textContent = 'in';
                redes.appendChild(linkedinLink);
            }

            if (miembro.twitter) {
                var twitterLink = document.createElement('a');
                twitterLink.href = miembro.twitter;
                twitterLink.className = 'team__red team__red--twitter';
                twitterLink.setAttribute('target', '_blank');
                twitterLink.setAttribute('rel', 'noopener noreferrer');
                twitterLink.setAttribute('aria-label', 'Twitter de ' + miembro.nombre);
                twitterLink.textContent = '𝕏';
                redes.appendChild(twitterLink);
            }

            if (miembro.github) {
                var githubLink = document.createElement('a');
                githubLink.href = miembro.github;
                githubLink.className = 'team__red team__red--github';
                githubLink.setAttribute('target', '_blank');
                githubLink.setAttribute('rel', 'noopener noreferrer');
                githubLink.setAttribute('aria-label', 'GitHub de ' + miembro.nombre);
                githubLink.textContent = '⌘';
                redes.appendChild(githubLink);
            }

            if (redes.childNodes.length > 0) {
                info.appendChild(redes);
            }

            card.appendChild(info);
            return card;
        }
    }

    if (!customElements.get('luthier-team')) {
        customElements.define('luthier-team', LuthierTeam);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierTeam = LuthierTeam;

})(typeof window !== 'undefined' ? window : this);
