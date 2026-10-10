/* =============================================================================
   GSEG · servicos-preview-a.js — PRÉVIA das Rodadas 17–19 (variante A estruturada)
   Melhoria progressiva: o HTML já funciona sem este arquivo (links wa.me completos,
   painéis visíveis, botão "Ver detalhes" oculto, sub-navegação como âncoras normais).
   O script:
   • troca o número dos links se a constante GSEG_WHATSAPP mudar;
   • recolhe os painéis (hidden), mostra "Ver detalhes" e liga aria-expanded; clique, Enter
     e Espaço (botão nativo) alternam; um painel aberto não fecha os outros; o card aberto
     passa a ocupar as 2 colunas (classe is-aberto);
   • atalhos por dor: rolam até o card e o destacam por 1,5 s (barra bronze);
   • sub-navegação fixa: marca o grupo visível (IntersectionObserver);
   • barra fixa do celular: some quando o fecho aparece;
   • mede a altura real do header para o sticky e o scroll-margin.
   ============================================================================= */
(function () {
  'use strict';

  const GSEG_WHATSAPP = "5534900000000"; // PLACEHOLDER — trocar pelo número real (os links do HTML são reescritos aqui)

  const pagina = document.querySelector('.pa-pagina');
  if (!pagina) return;
  pagina.classList.add('pa-js');

  // ----- zona de proteção do hero (nível 5 da estampa fixo no HTML: pa-i-5) -----
  (function () {
    // zona de proteção atrás da assinatura da responsável técnica (hero): mesma lógica do rodapé, medida no layout real
    const hero = document.querySelector('.pa-hero');
    let heroPend = false;
    function zonaHero() {
      heroPend = false;
      const E = window.gsegEstampa; if (!hero || !E) return;
      const cs = getComputedStyle(pagina), N = E.numero;
      const gF = N(cs.getPropertyValue('--est-g-op-forte'), .3), gZ = N(cs.getPropertyValue('--est-g-op-zona'), .1), wF = N(cs.getPropertyValue('--est-w-op-forte'), .1), wZ = N(cs.getPropertyValue('--est-w-op-zona'), .05);
      const r = E.caixas(hero, ['.pa-hero__assina']), w = hero.clientWidth, h = hero.clientHeight;
      hero.style.setProperty('--pa-zona-hero-g', E.mascara(w, h, r, gZ / gF, 10, 14));
      hero.style.setProperty('--pa-zona-hero-w', E.mascara(w, h, r, wZ / wF, 10, 14));
    }
    function agendarHero() { if (!heroPend) { heroPend = true; window.requestAnimationFrame(zonaHero); } }
    window.addEventListener('gseg:estampa', agendarHero); window.addEventListener('load', agendarHero); window.addEventListener('resize', agendarHero);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(agendarHero);
    if (window.ResizeObserver && hero) new ResizeObserver(agendarHero).observe(hero);
    agendarHero();
  })();

  // ----- WhatsApp: só reescreve o número se for diferente do que está no HTML -----
  Array.prototype.forEach.call(document.querySelectorAll('a.pa-wa'), function (link) {
    const url = new URL(link.href);
    if (url.pathname !== '/' + GSEG_WHATSAPP) {
      url.pathname = '/' + GSEG_WHATSAPP;
      link.href = url.toString();
    }
  });

  // ----- altura real do header (sticky da sub-navegação e scroll-margin) -----
  function medirHeader() {
    const header = document.querySelector('.cabecalho');
    if (header) document.documentElement.style.setProperty('--pa-header-h', Math.round(header.getBoundingClientRect().height) + 'px');
  }
  medirHeader();
  window.addEventListener('resize', medirHeader);
  // o header anima a própria altura ao mudar de largura: remede quando o tamanho dele muda de verdade (resize/rotação)
  if ('ResizeObserver' in window) {
    const header = document.querySelector('.cabecalho');
    if (header) new ResizeObserver(medirHeader).observe(header);
  }

  // ----- painéis -----
  const cards = Array.prototype.slice.call(document.querySelectorAll('.pa-card'));

  function definir(card, aberto) {
    const botao = card.querySelector('.pa-card__toggle');
    const painel = card.querySelector('.pa-painel');
    if (!botao || !painel) return;
    painel.hidden = !aberto;
    card.classList.toggle('is-aberto', aberto);
    botao.setAttribute('aria-expanded', String(aberto));
  }

  cards.forEach(function (card) {
    const botao = card.querySelector('.pa-card__toggle');
    if (!botao) return;
    botao.hidden = false;
    definir(card, false);
    botao.addEventListener('click', function () {
      definir(card, botao.getAttribute('aria-expanded') !== 'true');
    });
  });

  // ----- realce de 1,5 s (barra bronze) -----
  let temporizador = null;
  function realcar(card) {
    cards.forEach(function (c) { c.classList.remove('pa-card--realce'); });
    window.clearTimeout(temporizador);
    card.classList.add('pa-card--realce');
    temporizador = window.setTimeout(function () { card.classList.remove('pa-card--realce'); }, 1500);
  }

  // atalho do acesso rápido: rola e realça, mas NÃO abre o painel (abrir empurrava o card vizinho antes de a pessoa ler)
  let soRealcar = false;
  Array.prototype.forEach.call(document.querySelectorAll('.pa-atalho'), function (atalho) {
    atalho.addEventListener('click', function () {
      soRealcar = true;
      window.setTimeout(function () { soRealcar = false; }, 400);
      const alvo = document.getElementById(atalho.getAttribute('href').slice(1));
      if (alvo && alvo.classList.contains('pa-card')) realcar(alvo);
    });
  });

  // ----- abertura por âncora (#servico-…), p.ex. links vindos da home -----
  function abrirPorHash() {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const alvo = document.getElementById(id);
    if (!alvo || !alvo.classList.contains('pa-card')) return;
    if (!soRealcar) definir(alvo, true);
    soRealcar = false;
    realcar(alvo);
    alvo.scrollIntoView({ block: 'start' });
  }
  abrirPorHash();
  window.addEventListener('hashchange', abrirPorHash);

  // ----- sub-navegação: marca o grupo que cruza o meio da tela -----
  if ('IntersectionObserver' in window) {
    const links = Array.prototype.slice.call(document.querySelectorAll('.pa-subnav__a'));
    const grupos = ['sst', 'meio-ambiente'].map(function (id) { return document.getElementById(id); }).filter(Boolean);
    const observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        links.forEach(function (a) {
          if (a.getAttribute('href') !== '#' + e.target.id) return;
          if (e.isIntersecting) {
            links.forEach(function (o) { o.setAttribute('aria-current', 'false'); });
            a.setAttribute('aria-current', 'true');
          } else if (a.getAttribute('aria-current') === 'true') {
            a.setAttribute('aria-current', 'false');     // saiu da tela (p.ex. voltou ao topo): nenhum grupo marcado
          }
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    grupos.forEach(function (g) { observador.observe(g); });

    // ----- barra fixa do celular some quando o fecho aparece -----
    const barra = document.querySelector('.pa-barra');
    const fecho = document.getElementById('fecho');
    if (barra && fecho) {
      new IntersectionObserver(function (entradas) {
        barra.classList.toggle('pa-barra--oculta', entradas[0].isIntersecting);
      }).observe(fecho);
    }
  }
})();
