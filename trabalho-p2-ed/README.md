# Trabalho P2: Árvore Binária de Busca (BST)

> 🎥 **Vídeo explicativo:** [https://drive.google.com/file/d/1ElxsouVdieUSfOO78X1CG9ODF7Kjd-cK/view?usp=sharing]

**Aluno:** [Marco Antonio Seredynski] | **RA:** [2840482521024]
**Tema escolhido:** B, Árvores Binárias de Busca
**Disciplina:** Estrutura de Dados, Fatec Ribeirão Preto (ADS), 2026.2

## Como executar

- Python: `python src/algoritmo.py` (roda 3 cenários e imprime a saída e o número de comparações).
- Simulador: abra `src/demo/index.html` no navegador. Não precisa de servidor nem instalação.

```
trabalho-p2-ed/
├── README.md
└── src/
    ├── algoritmo.py
    └── demo/ (index.html, styles.css, app.js)
```

## Resumo teórico

Uma BST é uma árvore binária em que, para todo nó, as chaves da subárvore esquerda são menores e as da direita são maiores que a chave do nó. Isso permite buscar, inserir e remover descendo um único caminho da raiz até uma folha, descartando metade da árvore a cada comparação quando ela está equilibrada.

- **Inserção e busca:** compara com o nó atual e desce à esquerda ou à direita até achar a chave (busca) ou um ponto vazio (inserção).
- **Remoção:** três casos. Folha: remove. Um filho: o filho ocupa o lugar. Dois filhos: copia a chave do sucessor in-order (menor da subárvore direita) para o nó e remove o sucessor.
- **Travessias:** em ordem (esq, raiz, dir) devolve as chaves ordenadas; pré-ordem (raiz, esq, dir) serve para copiar/serializar a árvore; pós-ordem (esq, dir, raiz) serve para apagar a árvore ou avaliar expressões.
- **Altura:** número de arestas do maior caminho da raiz a uma folha (vazia = -1).
- **Uso no mundo real:** base de conjuntos e mapas ordenados e de índices de bancos de dados. Na prática usam-se variantes auto-balanceadas (AVL, rubro-negra, B-tree) para evitar o pior caso.

## Complexidade assintótica

`h` é a altura da árvore: `h ≈ log₂ n` quando ela é equilibrada (melhor caso e caso médio com inserção aleatória) e `h = n - 1` quando é degenerada (pior caso). Cada célula mostra **tempo / espaço auxiliar**.

| Operação | Melhor caso | Caso médio | Pior caso |
|---|---|---|---|
| Busca | O(1) / O(1) (chave na raiz) | O(log n) / O(1) | O(n) / O(1) |
| Inserção | O(1) / O(1) (raiz com lado livre) | O(log n) / O(1) | O(n) / O(1) |
| Remoção (versão recursiva do Python) | O(1) / O(1) (raiz com até 1 filho) | O(log n) / O(log n) | O(n) / O(n) |
| Travessias (in/pre/post) | O(n) / O(log n) | O(n) / O(log n) | O(n) / O(n) |
| Altura | O(n) / O(log n) | O(n) / O(log n) | O(n) / O(n) |
| Construir com n inserções | O(n log n) | O(n log n) | O(n²) |

O espaço auxiliar das travessias, da altura e da remoção vem da pilha de recursão, que tem profundidade `h`. Busca e inserção são iterativas e usam O(1).

**Por que o pior caso ocorre:** inserir chaves já ordenadas (1, 2, 3, ...) faz cada nova chave ir sempre para o mesmo lado. A árvore vira uma lista encadeada com altura n - 1, e a i-ésima inserção compara com i - 1 nós. O total é n(n - 1)/2 comparações. O `algoritmo.py` mostra isso com n = 200: 19.900 comparações e altura 199 na inserção ordenada, contra cerca de 1.600 comparações e altura 16 na aleatória.

## Simulador visual

- Operações: inserir, buscar, remover e as 3 travessias, com animação do caminho percorrido.
- Controles: Play, Próximo passo, Pausar, Reset (volta ao início da operação atual e a desfaz), Esvaziar árvore e seletor de velocidade.
- Cenários: caso médio (inserção embaralhada), pior caso (inserção crescente), exemplo customizado (suas próprias chaves).
- Botão **Comparar O(log n) × O(n)**: insere as mesmas 15 chaves em ordem aleatória e em ordem crescente, e mostra as duas árvores lado a lado com altura e comparações.
- Painel com passo atual, comparações acumuladas, nº de nós e altura, nó atual, caminho percorrido e log explicativo.

## Diário de Engenharia com IA

**Ferramenta usada:** Claude (Anthropic), pelo chat claude.ai. 
**3 principais prompts** :

1. Com base no enunciado anexado, implemente o Tema B (BST): (1) `src/algoritmo.py` com type hints, docstrings, contador de comparações e 3 cenários de teste no `__main__`; (2) simulador em `src/demo/` com Play, Passo, Pausar, Reset, cenários pré-configurados, botão comparando inserção aleatória × ordenada e painel de métricas. Siga exatamente a estrutura de pastas do enunciado.
2. Revise o projeto como um avaliador seguindo a rubrica do enunciado: procure bugs no simulador, imprecisões na tabela de complexidade e problemas de contraste. Corrija o que for erro e liste o que mudou.
3. Avalie o projeto e dê um contexto para alterações futuras, e maiores.

**Erro, limitação ou ajuste manual:** na primeira versão, inserir duas chaves seguidas sem executar a primeira descartava a primeira. Foi corrigido na revisão.
**Lição sobre prompts:** pedidos curtos e genéricos geram um resultado funcional, mas só a revisão com critérios (rubrica) achou os problemas. Hoje eu já incluiria os critérios no primeiro prompt

