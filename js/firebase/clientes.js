document.getElementById('formCliente')
  .addEventListener('submit', function (event) {
    event.preventDefault() //evita recarregar 
    //efetuando validações
    if (document.getElementById('nome').value.length < 5) {
      alerta('⚠ O nome é muito curto!', 'warning')
      document.getElementById('nome').focus()
    } else if (document.getElementById('nome').value.length > 100) {
      alerta('⚠ O nome é muito longo!', 'warning')
      document.getElementById('nome').focus()
    }
    //criando o objeto cliente/locação
    //campo do sexo
    let sexoSelecionado = ''
    if (document.getElementById('sexo-0').checked) {
      sexoSelecionado = 'Masculino'
    } else {
      sexoSelecionado = 'Feminino'
    }

    const dadosCliente = {
      nome: document.getElementById('nome').value,
      email: document.getElementById('email').value,
      nascimento: document.getElementById('nascimento').value,
      sexo: sexoSelecionado,
      cod: document.getElementById('cod').value

    }

    if (document.getElementById('id').value !== '') { //Se existir algo, iremos alterar
      alterar(event, 'clientes', dadosCliente, document.getElementById('id').value)
    } else {
      incluir(event, 'clientes', dadosCliente)
    }
  })



async function incluir(event, collection, dados) {
  event.preventDefault()
  return await firebase.database().ref(collection).push(dados)
    .then(() => {
      alerta('✅ Locação concluida com sucesso ✅', 'success')
      document.getElementById('formCliente').reset()//limpa
    })
    .catch(error => {
      alerta('❎ Falha ao concluir a locação ❎: ' + error.message, 'danger')
    })
}

async function alterar(event, collection, dados) {
  event.preventDefault()
  return await firebase.database().ref().child(collection + '/' + dados.id).update(dados)
    .then(() => {
      alerta('✅ Locação alterada com sucesso ✅', 'success')
      document.getElementById('formCliente').reset()//limpa
    })
    .catch(error => {
      alerta('❎ Falha ao alterar a locação ❎: ' + error.message, 'danger')
    })
}

// Obtém os dados dos clientes do Firebase
async function obtemClientes() {
  let tabela = document.getElementById('tabelaDados')

  await firebase.database().ref('clientes').orderByChild('nome').on('value', (snapshot) => {
    tabela.innerHTML = ''
    tabela.innerHTML += `<tr class='bg-info'>
      <th>Nome</th> <th>E-mail</th> <th>Nascimento</th>
      <th>Sexo</th> <th>Código do Livro</th> <th>Opções</th>
    </tr>`
    snapshot.forEach(item => {
      //dados firebase
      let db = item.ref._delegate._path.pieces_[0] //nome da collection
      let id = item.ref._delegate._path.pieces_[1] //id do registro
      //criando novas linhas na tabela
      let novaLinha = tabela.insertRow() //inserindo uma nova linha 
      novaLinha.insertCell().textContent = item.val().nome
      novaLinha.insertCell().textContent = item.val().email
      novaLinha.insertCell().textContent = item.val().nascimento
      novaLinha.insertCell().textContent = item.val().sexo
      novaLinha.insertCell().textContent = item.val().cod
      novaLinha.insertCell().innerHTML = `<button class='btn btn-sm btn-danger' title='Apagar locação selecionada' onclick=remover('${db}','${id}')> <i class='bi bi-trash'></i> </button>
                                            <button class='btn btn-sm btn-warning' title='Editar locação selecionada'onclick=carregaDadosAlteracao('${db}','${id}')> <i class='bi bi-pencil-square'></i> </button>`
    })
  })
}

async function remover(db, id) {
  if (window.confirm('❗ Confirma a remoção da locação? ❗')) {
    let dadosExclusao = await firebase.database().ref().child(db + '/' + id)
    dadosExclusao.remove()
      .then(() => {
        alerta('✅ Locação removida com sucesso! ✅', 'success')
      })
      .catch(error => {
        alerta(`❌ Falha ao apagar a locação: ${error.message} `)
      })
  }
}

async function carregaDadosAlteracao(db, id) {
  await firebase.database().ref(db + '/' + id).on('value', (snapshot) => {
    document.getElementById('id').value = id
    document.getElementById('nome').value = snapshot.val().nome
    document.getElementById('email').value = snapshot.val().email
    document.getElementById('nascimento').value = snapshot.val().nascimento
    document.getElementById('cod').value = snapshot.val().cod
    if (snapshot.val().sexo === 'Feminino') {
      document.getElementById('sexo-1').checked = true
    } else {
      document.getElementById('sexo-0').checked = true //Masculino
    }
  })
  document.getElementById('nome').focus() //Foco no campo nome
}
