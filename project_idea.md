Criar um app para auxiliar em testes de webhook no localhost.

O app no server site vai rodar no site webhook.eduartepaiva.com.

vai receber requests de sites permitidos, como replicate ia ou stripe.vai .  
Não vai mais precisar disto, cara usuário vai possuir um uuid.
Quando receber esta requisição vai reenviar para o usuário específico, se o usuário estiver
conectado ao server no momento.

redirecionar para minha aplicação no client side.meu client side vai fazer o mesmo post para localhost.
ideias:javascript - How can i listen for http requests on a client side - Stack Overflow

e webhook site.
coisas que preciso fazer:
um app cli que permite o firewall receber de webhook.eduartepaiva.com
um backend que vai ouvir webhooks e enviar mensagem para .
vai ser em golang

vou usar server sent events para comunicar entre servidor e client.

O client vai ser
