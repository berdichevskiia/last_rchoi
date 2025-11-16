function showDemo(){ location.hash = '#demo'; document.getElementById('name').focus(); }
document.getElementById('feedbackForm').addEventListener('submit', function(e){
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  if(!name || !email || !message){ alert('Пожалуйста, заполните все поля.'); return; }
  // Эмуляция отправки — здесь можно добавить fetch к реальному API
  const notice = document.getElementById('notice');
  notice.hidden = false;
  notice.textContent = 'Спасибо, ' + name + '! Ваше сообщение получено (локальная эмуляция).';
  // Очистим форму
  document.getElementById('feedbackForm').reset();
});