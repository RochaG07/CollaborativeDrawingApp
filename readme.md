

[X] - Desenhar no canvas
[X] - Emitir o desenho de um client para todos os outros
[X] - Desenhar o que o client recebe do server 
[X] - Desenhar tudo o que foi desenhado em uma nova conexão
[ ] - Undo

transmitir o desenhar para o server

as coordenadas estão sendo transmitidas corretamente

só o eixo Y não funciona corretamente? Sim, era isso Bruh

socket.emit => Só mandou pro socket conectado por isso só apareceu pro client que desenhou, trocar por io.emit resolveu

otimização => Ao invez de enviar do server para o cliente o proprio desenho, desenhar diretamente no html

ter uma lista de todas as linhas e desenhalas tudo de uma vez ao ter uma nova conexão parece desperdicio

estado do canvas?

pegar o estado do canvas de um client já conectado (o mais antigo) e transferilo para o recém conectado
pelo contexto? Sim, ctx.getImageData(0, 0, canvas.width, canvas.height)

Se todos os clients desconcotarem não é possível recuperar o que foi feito no canvas
**Tentativa 1:**
Caso o último client conectado desconecte, salvar o imgData do canvas dele e envia-lo para o próximo client conectado
client não consegue responder o emit pois foi desconectado?
não dá pra fazer uma ação de emit no 'disconect'?
**Solução:**
Guardo em uma variável o imgData toda vez que foi requisitado o imgData do client mais antigo
envio para o front essa imgData se apenas houver 1 client conectado


Pegar no array de sockets conectados o que tem o mesmo socket.id do oldestUserId e apenas enviar para ele um emit pedindo o imgData do canvas dele 

Ao inves de salvar os ids dos sockets passei a salvar os sockets, com isso evito de ter que buscar o id na hora de pedir o canvas

funcionalidade de CTRL + Z?

gravar o conjunto de linha do perído entre um isDrawing?
passar o isDrawing junto as coordernadas para o server?


### Ciclo? antigo de pegar a imgData do último client logado e passar para o client recém conectado
**server:emit | request current canvas:
\/
front:on | request current canvas
\/
front:emit | send imgData 
\/
server:on | send imgData 
\/
server:emit | send current canvas content
\/
front:on |send current canvas content

*Refatorei para utilizar Acknowledgements, fazendo isso me livrei do problema de enviar o imgData para todos os clients* 

server:emit request current canvas => Acknowledgements => send current canvas content

Acknowledgements para pegar uma informação do client