/**
 * LuthierSearch - Búsqueda global del sitio
 *
 * Componente de búsqueda que filtra contenido definido en un array global.
 * Funciona con protocolo file:/// ya que no requiere servidor.
 *
 * ATRIBUTOS:
 * - datos       : Nombre de la variable global con los datos (default: LUTHIER_SEARCH_DATA)
 * - placeholder : Texto del placeholder (default: Buscar...)
 * - min-chars   : Mínimo de caracteres para buscar (default: 2)
 * - max-resultados : Máximo de resultados a mostrar (default: 10)
 * - campos      : Campos a buscar separados por coma (default: titulo,contenido)
 *
 * ESTRUCTURA DE DATOS:
 * window.LUTHIER_SEARCH_DATA = [
 *     { titulo: 'Página 1', contenido: 'Texto...', url: 'pagina1.html', categoria: 'Blog' },
 *     { titulo: 'Página 2', contenido: 'Texto...', url: 'pagina2.html', categoria: 'Docs' }
 * ];
 *
 * @example Uso básico
 * <luthier-search></luthier-search>
 *
 * @example Con opciones
 * <luthier-search datos="MIS_DATOS" placeholder="¿Qué buscas?" max-resultados="5"></luthier-search>
 */
(function(global) {
    'use strict';

    class LuthierSearch extends HTMLElement {

        connectedCallback() {
            setTimeout(this._init.bind(this), 0);
        }

        _init() {
            this._config = {
                datos: this.getAttribute('datos') || 'LUTHIER_SEARCH_DATA',
                placeholder: this.getAttribute('placeholder') || 'Buscar...',
                minChars: parseInt(this.getAttribute('min-chars'), 10) || 2,
                maxResultados: parseInt(this.getAttribute('max-resultados'), 10) || 10,
                campos: (this.getAttribute('campos') || 'titulo,contenido').split(',').map(function(c) { return c.trim(); })
            };

            this._datos = global[this._config.datos] || [];
            this._construirDOM();
            this._agregarEventos();
        }

        _construirDOM() {
            this.textContent = '';
            this.classList.add('search-wrapper');

            var container = document.createElement('div');
            container.className = 'search';

            // Input de búsqueda
            var inputContainer = document.createElement('div');
            inputContainer.className = 'search__input-container';

            var icono = document.createElement('span');
            icono.className = 'search__icono';
            icono.textContent = '🔍';
            icono.setAttribute('aria-hidden', 'true');
            inputContainer.appendChild(icono);

            var input = document.createElement('input');
            input.type = 'search';
            input.className = 'search__input';
            input.placeholder = this._config.placeholder;
            input.setAttribute('aria-label', 'Búsqueda');
            input.setAttribute('autocomplete', 'off');
            inputContainer.appendChild(input);

            var btnLimpiar = document.createElement('button');
            btnLimpiar.className = 'search__limpiar';
            btnLimpiar.textContent = '×';
            btnLimpiar.setAttribute('aria-label', 'Limpiar búsqueda');
            btnLimpiar.style.display = 'none';
            inputContainer.appendChild(btnLimpiar);

            container.appendChild(inputContainer);

            // Resultados
            var resultados = document.createElement('div');
            resultados.className = 'search__resultados';
            resultados.setAttribute('role', 'listbox');
            resultados.style.display = 'none';
            container.appendChild(resultados);

            this.appendChild(container);

            this._input = input;
            this._btnLimpiar = btnLimpiar;
            this._resultados = resultados;
        }

        _agregarEventos() {
            var self = this;
            var timeoutId = null;

            this._input.addEventListener('input', function() {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(function() {
                    self._buscar();
                }, 200);
            });

            this._input.addEventListener('focus', function() {
                if (self._input.value.length >= self._config.minChars) {
                    self._resultados.style.display = 'block';
                }
            });

            this._btnLimpiar.addEventListener('click', function() {
                self._input.value = '';
                self._resultados.style.display = 'none';
                self._btnLimpiar.style.display = 'none';
                self._input.focus();
            });

            // Cerrar al hacer clic fuera
            document.addEventListener('click', function(e) {
                if (!self.contains(e.target)) {
                    self._resultados.style.display = 'none';
                }
            });

            // Navegación con teclado
            this._input.addEventListener('keydown', function(e) {
                self._navegarResultados(e);
            });
        }

        _buscar() {
            var query = this._input.value.trim().toLowerCase();

            // Mostrar/ocultar botón limpiar
            this._btnLimpiar.style.display = query ? 'block' : 'none';

            if (query.length < this._config.minChars) {
                this._resultados.style.display = 'none';
                return;
            }

            var resultados = this._filtrarDatos(query);
            this._mostrarResultados(resultados);
        }

        _filtrarDatos(query) {
            var self = this;
            var resultados = [];
            var palabras = query.split(/\s+/);

            for (var i = 0; i < this._datos.length; i++) {
                var item = this._datos[i];
                var score = 0;

                for (var j = 0; j < this._config.campos.length; j++) {
                    var campo = this._config.campos[j];
                    var valor = (item[campo] || '').toLowerCase();

                    for (var k = 0; k < palabras.length; k++) {
                        if (valor.indexOf(palabras[k]) !== -1) {
                            // Mayor peso para coincidencias en título
                            score += (campo === 'titulo') ? 10 : 1;
                        }
                    }
                }

                if (score > 0) {
                    resultados.push({
                        item: item,
                        score: score
                    });
                }
            }

            // Ordenar por relevancia
            resultados.sort(function(a, b) {
                return b.score - a.score;
            });

            return resultados.slice(0, this._config.maxResultados);
        }

        _mostrarResultados(resultados) {
            this._resultados.textContent = '';

            if (resultados.length === 0) {
                var sinResultados = document.createElement('div');
                sinResultados.className = 'search__sin-resultados';
                sinResultados.textContent = 'No se encontraron resultados';
                this._resultados.appendChild(sinResultados);
            } else {
                for (var i = 0; i < resultados.length; i++) {
                    var resultado = this._crearResultado(resultados[i].item, i);
                    this._resultados.appendChild(resultado);
                }
            }

            this._resultados.style.display = 'block';
        }

        _crearResultado(item, indice) {
            var resultado = document.createElement('a');
            resultado.className = 'search__resultado';
            resultado.href = item.url || '#';
            resultado.setAttribute('role', 'option');
            resultado.setAttribute('data-indice', indice);

            // Categoría
            if (item.categoria) {
                var categoria = document.createElement('span');
                categoria.className = 'search__resultado-categoria';
                categoria.textContent = item.categoria;
                resultado.appendChild(categoria);
            }

            // Título
            var titulo = document.createElement('div');
            titulo.className = 'search__resultado-titulo';
            titulo.textContent = item.titulo || 'Sin título';
            resultado.appendChild(titulo);

            // Extracto
            if (item.contenido) {
                var extracto = document.createElement('div');
                extracto.className = 'search__resultado-extracto';
                extracto.textContent = this._truncarTexto(item.contenido, 100);
                resultado.appendChild(extracto);
            }

            return resultado;
        }

        _truncarTexto(texto, maxLength) {
            if (texto.length <= maxLength) return texto;
            return texto.substring(0, maxLength).trim() + '...';
        }

        _navegarResultados(e) {
            var items = this._resultados.querySelectorAll('.search__resultado');
            if (items.length === 0) return;

            var actual = this._resultados.querySelector('.search__resultado--activo');
            var indice = actual ? parseInt(actual.getAttribute('data-indice'), 10) : -1;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                indice = (indice + 1) % items.length;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                indice = indice <= 0 ? items.length - 1 : indice - 1;
            } else if (e.key === 'Enter' && actual) {
                e.preventDefault();
                window.location.href = actual.href;
                return;
            } else if (e.key === 'Escape') {
                this._resultados.style.display = 'none';
                return;
            } else {
                return;
            }

            // Actualizar clase activa
            for (var i = 0; i < items.length; i++) {
                items[i].classList.remove('search__resultado--activo');
            }
            items[indice].classList.add('search__resultado--activo');
            items[indice].scrollIntoView({ block: 'nearest' });
        }

        // API pública
        setDatos(datos) {
            this._datos = datos;
        }

        focus() {
            this._input.focus();
        }
    }

    if (!customElements.get('luthier-search')) {
        customElements.define('luthier-search', LuthierSearch);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierSearch = LuthierSearch;

})(typeof window !== 'undefined' ? window : this);
