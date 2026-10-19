/* =============================================================================
   GSEG · hero-checagem.js — checagem rápida do hero (prévia T6)
   -----------------------------------------------------------------------------
   O botão já sai no HTML como um link válido do WhatsApp com a mensagem base
   (funciona sem JS). Este módulo só reescreve o href com os itens marcados.
   O número é lido do próprio href do HTML, nunca fixado aqui.
   ============================================================================= */
(function () {
  'use strict';

  var botao = document.getElementById('chk-enviar');
  if (!botao) return;
  var caixas = document.querySelectorAll('.hero__chk-input');
  var base = botao.getAttribute('href').split('?')[0];   // https://wa.me/<número>

  function mensagem() {
    var itens = [];
    for (var i = 0; i < caixas.length; i++) {
      if (caixas[i].checked) itens.push('- ' + caixas[i].getAttribute('data-msg'));
    }
    var texto = 'Olá, Lívia! Vim pelo site da GSEG.\n\n';
    if (itens.length) texto += 'Na checagem rápida marquei que preciso de:\n' + itens.join('\n') + '\n\n';
    return texto + 'Podemos conversar?';
  }

  function atualizar() {
    botao.setAttribute('href', base + '?text=' + encodeURIComponent(mensagem()));
  }

  for (var j = 0; j < caixas.length; j++) caixas[j].addEventListener('change', atualizar);
  atualizar();   // cobre caixas que o navegador restaurou marcadas ao voltar à página
})();
