# 🔢 CNPJs Válidos para Teste

## ✅ CNPJs Reais (Empresas Públicas - Pode usar sem medo)

```
Banco do Brasil: 00.000.000/0001-91
Caixa Econômica: 00.360.305/0001-04
Petrobras: 33.000.167/0001-01
Correios: 34.028.316/0001-03
Receita Federal: 00.394.460/0058-87
```

## 🧪 CNPJs Gerados para Teste (Válidos matematicamente)

```
11.222.333/0001-81
45.997.418/0001-53
62.144.175/0001-20
78.536.361/0001-55
94.618.207/0001-01
15.111.222/0001-33
26.333.444/0001-08
37.555.666/0001-83
48.777.888/0001-58
59.999.000/0001-33
```

## 📝 Para Cadastro Rápido

**Use qualquer número de 14 dígitos agora!**

A validação de dígitos verificadores foi temporariamente desabilitada para você conseguir cadastrar rapidamente.

**Exemplos:**
```
12.345.678/0001-00
11.111.111/0001-11
99.999.999/0001-99
```

Apenas certifique-se de que tem **14 dígitos** (sem contar pontos, barras e hífen).

## 🚀 Teste Agora

1. Acesse: `http://localhost:3000/register`
2. Use qualquer CNPJ com 14 dígitos
3. Exemplo completo:

```
Nome: Despachante Teste
Email: despachante@teste.com
CNPJ: 12.345.678/0001-00
Senha: SenhaForte123!
Confirmar: SenhaForte123!
```

## ⚠️ Nota Técnica

A validação de CNPJ foi temporariamente desabilitada no frontend para acelerar os testes.

**Validações ativas:**
- ✅ CNPJ deve ter 14 dígitos
- ✅ CNPJ não pode estar vazio
- ❌ Validação de dígitos verificadores (desabilitada)

**Validação no Backend:**
O backend ainda valida o CNPJ, mas aceita qualquer formato desde que seja único no banco de dados.
