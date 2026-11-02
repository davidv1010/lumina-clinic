/* ==========================================================================
   Lumina Clinic — interações do site
   Sem dependências externas.
   ========================================================================== */

// Número do WhatsApp da clínica (somente dígitos, com DDI 55 e DDD)
const WHATSAPP = '5531987654321';

/* ---------- Menu: fundo ao rolar + abrir/fechar no celular ---------- */
const menu = document.getElementById('menu');
const toggle = menu.querySelector('.menu-toggle');

function atualizarMenu() {
  menu.classList.toggle('rolado', window.scrollY > 40);
}
atualizarMenu();
window.addEventListener('scroll', atualizarMenu, { passive: true });

function fecharMenu() {
  menu.classList.remove('aberto');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir menu');
}

toggle.addEventListener('click', () => {
  const aberto = menu.classList.toggle('aberto');
  toggle.setAttribute('aria-expanded', String(aberto));
  toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
});

// Fecha o menu ao clicar em um link ou apertar Esc
menu.querySelectorAll('.menu-links a').forEach((link) => link.addEventListener('click', fecharMenu));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu.classList.contains('aberto')) {
    fecharMenu();
    toggle.focus();
  }
});

/* ---------- Animação discreta ao rolar a página ---------- */
const elementosRevelar = document.querySelectorAll('.revelar');
if ('IntersectionObserver' in window) {
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visivel');
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  elementosRevelar.forEach((el) => observador.observe(el));
} else {
  elementosRevelar.forEach((el) => el.classList.add('visivel'));
}

/* ---------- Cards de serviço: botão "Saiba mais" ---------- */
document.querySelectorAll('.saiba-mais').forEach((botao) => {
  const detalhes = document.getElementById(botao.getAttribute('aria-controls'));
  botao.addEventListener('click', () => {
    const aberto = botao.getAttribute('aria-expanded') === 'true';
    botao.setAttribute('aria-expanded', String(!aberto));
    detalhes.classList.toggle('visivel', !aberto);
    botao.firstChild.textContent = aberto ? 'Saiba mais ' : 'Ver menos ';
  });
});

/* ---------- Depoimentos: carrossel ---------- */
const carrossel = document.querySelector('.carrossel');
if (carrossel) {
  const trilho = carrossel.querySelector('.carrossel-trilho');
  const slides = [...trilho.children];
  const pontos = carrossel.querySelector('.pontos');
  const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let atual = 0;
  let timer;

  // Cria um ponto para cada depoimento
  slides.forEach((_, i) => {
    const ponto = document.createElement('button');
    ponto.type = 'button';
    ponto.setAttribute('aria-label', `Ver depoimento ${i + 1}`);
    ponto.addEventListener('click', () => { irPara(i); reiniciar(); });
    pontos.appendChild(ponto);
  });

  function irPara(indice) {
    atual = (indice + slides.length) % slides.length;
    trilho.style.transform = `translateX(-${atual * 100}%)`;
    slides.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i !== atual)));
    [...pontos.children].forEach((p, i) => p.setAttribute('aria-current', String(i === atual)));
  }

  // Avança sozinho a cada 7s; pausa quando o mouse ou o foco está no carrossel
  function iniciar() {
    if (reduzirMovimento) return;
    timer = setInterval(() => irPara(atual + 1), 7000);
  }
  function parar() { clearInterval(timer); }
  function reiniciar() { parar(); iniciar(); }

  carrossel.querySelector('[data-carrossel="anterior"]').addEventListener('click', () => { irPara(atual - 1); reiniciar(); });
  carrossel.querySelector('[data-carrossel="proximo"]').addEventListener('click', () => { irPara(atual + 1); reiniciar(); });
  carrossel.addEventListener('mouseenter', parar);
  carrossel.addEventListener('mouseleave', iniciar);
  carrossel.addEventListener('focusin', parar);
  carrossel.addEventListener('focusout', iniciar);

  // Deslizar com o dedo no celular
  let inicioX = null;
  trilho.addEventListener('touchstart', (e) => { inicioX = e.touches[0].clientX; parar(); }, { passive: true });
  trilho.addEventListener('touchend', (e) => {
    if (inicioX === null) return;
    const delta = e.changedTouches[0].clientX - inicioX;
    if (Math.abs(delta) > 40) irPara(atual + (delta < 0 ? 1 : -1));
    inicioX = null;
    iniciar();
  });

  irPara(0);
  iniciar();
}

/* ---------- Perguntas frequentes: acordeão ---------- */
document.querySelectorAll('.faq-pergunta').forEach((pergunta) => {
  pergunta.addEventListener('click', () => {
    const item = pergunta.closest('.faq-item');
    const aberto = item.classList.toggle('aberto');
    pergunta.setAttribute('aria-expanded', String(aberto));
  });
});

/* ---------- Formulário: valida e abre o WhatsApp com a mensagem ---------- */
const form = document.getElementById('form-agendamento');
const telefone = document.getElementById('telefone');

// Máscara simples de telefone: (31) 90000-0000
telefone.addEventListener('input', () => {
  const d = telefone.value.replace(/\D/g, '').slice(0, 11);
  let v = d;
  if (d.length > 2) v = `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length > 7) v = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
  telefone.value = v;
});

function validarCampo(campo, valido) {
  const wrapper = campo.closest('.campo');
  wrapper.classList.toggle('invalido', !valido);
  campo.setAttribute('aria-invalid', String(!valido));
  campo.setAttribute('aria-describedby', `erro-${campo.id}`);
  return valido;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = form.nome;
  const procedimento = form.procedimento;
  const mensagem = form.mensagem.value.trim();

  const ok = [
    validarCampo(nome, nome.value.trim().length >= 2),
    validarCampo(telefone, telefone.value.replace(/\D/g, '').length >= 10),
    validarCampo(procedimento, procedimento.value !== ''),
  ];
  if (ok.includes(false)) {
    form.querySelector('.invalido input, .invalido select').focus();
    return;
  }

  const texto = [
    'Olá, Lumina Clinic! Gostaria de agendar uma avaliação.',
    `Nome: ${nome.value.trim()}`,
    `Telefone: ${telefone.value}`,
    `Procedimento de interesse: ${procedimento.value}`,
    mensagem ? `Mensagem: ${mensagem}` : '',
  ].filter(Boolean).join('\n');

  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
});

/* ---------- Ano atual no rodapé ---------- */
document.getElementById('ano').textContent = new Date().getFullYear();
