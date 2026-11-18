"""Árvore Binária de Busca (BST) instrumentada com contador de comparações.

Convenção de contagem (a mesma do simulador em src/demo/app.js):
cada nó cuja chave é comparada com a chave inserida, buscada ou removida
conta 1 comparação. Chaves duplicadas são ignoradas.

Obs.: travessias, altura e remoção são recursivas, então uma árvore degenerada
com mais de ~990 níveis estoura o limite de recursão do Python (n = 200 é seguro).

Executar: python algoritmo.py
"""
from __future__ import annotations

import random
from dataclasses import dataclass
from typing import List, Optional, Tuple


@dataclass
class Node:
    """Nó da árvore: uma chave e referências para os filhos."""

    key: int
    left: Optional[Node] = None
    right: Optional[Node] = None


class BST:
    """BST sem duplicatas. `comparisons` acumula o custo das operações."""

    def __init__(self) -> None:
        self.root: Optional[Node] = None
        self.size: int = 0
        self.comparisons: int = 0

    # ---------------------------------------------------------------- insert
    def insert(self, key: int) -> bool:
        """Insere `key`. Retorna False se ela já existia. Tempo O(h)."""
        if self.root is None:
            self.root = Node(key)
            self.size += 1
            return True
        cur = self.root
        while True:
            self.comparisons += 1
            if key == cur.key:
                return False
            if key < cur.key:
                if cur.left is None:
                    cur.left = Node(key)
                    break
                cur = cur.left
            else:
                if cur.right is None:
                    cur.right = Node(key)
                    break
                cur = cur.right
        self.size += 1
        return True

    # ---------------------------------------------------------------- search
    def search(self, key: int) -> bool:
        """Retorna True se `key` está na árvore. Tempo O(h)."""
        cur = self.root
        while cur is not None:
            self.comparisons += 1
            if key == cur.key:
                return True
            cur = cur.left if key < cur.key else cur.right
        return False

    # ---------------------------------------------------------------- delete
    def delete(self, key: int) -> bool:
        """Remove `key`. Retorna False se ela não existia. Tempo O(h)."""
        self.root, removed = self._delete(self.root, key)
        if removed:
            self.size -= 1
        return removed

    def _delete(self, node: Optional[Node], key: int) -> Tuple[Optional[Node], bool]:
        """Remove `key` da subárvore `node` e devolve (nova_raiz, removeu)."""
        if node is None:
            return None, False
        self.comparisons += 1
        if key < node.key:
            node.left, removed = self._delete(node.left, key)
            return node, removed
        if key > node.key:
            node.right, removed = self._delete(node.right, key)
            return node, removed
        # Achou o nó. Caso 1 e 2: zero ou um filho -> o filho assume o lugar.
        if node.left is None:
            return node.right, True
        if node.right is None:
            return node.left, True
        # Caso 3: dois filhos -> copia o sucessor in-order e remove o sucessor.
        succ = node.right
        while succ.left is not None:
            succ = succ.left
        node.key = succ.key
        node.right, _ = self._delete(node.right, succ.key)
        return node, True

    # ------------------------------------------------------------ travessias
    def traverse(self, order: str) -> List[int]:
        """Percorre a árvore em 'in', 'pre' ou 'post' ordem. Tempo O(n)."""
        out: List[int] = []

        def go(n: Optional[Node]) -> None:
            if n is None:
                return
            if order == "pre":
                out.append(n.key)
            go(n.left)
            if order == "in":
                out.append(n.key)
            go(n.right)
            if order == "post":
                out.append(n.key)

        go(self.root)
        return out

    def in_order(self) -> List[int]:
        """Esquerda, raiz, direita (resultado sempre ordenado)."""
        return self.traverse("in")

    def pre_order(self) -> List[int]:
        """Raiz, esquerda, direita."""
        return self.traverse("pre")

    def post_order(self) -> List[int]:
        """Esquerda, direita, raiz."""
        return self.traverse("post")

    def height(self) -> int:
        """Altura em arestas (árvore vazia = -1, só a raiz = 0)."""

        def h(n: Optional[Node]) -> int:
            return -1 if n is None else 1 + max(h(n.left), h(n.right))

        return h(self.root)


def build(keys: List[int]) -> BST:
    """Cria uma BST inserindo as chaves na ordem recebida."""
    tree = BST()
    for k in keys:
        tree.insert(k)
    return tree


# ------------------------------------------------------------------- testes
def cenario_comum() -> None:
    """Cenário 1: inserção em ordem embaralhada (caso médio)."""
    print("=== Cenário 1: caso comum (inserção embaralhada) ===")
    chaves = [47, 21, 76, 13, 32, 58, 89, 5, 17, 27, 40, 66, 82, 95, 52]
    t = build(chaves)
    print("in-order  :", t.in_order())
    assert t.in_order() == sorted(chaves)  # a travessia em ordem sempre sai ordenada
    print("pre-order :", t.pre_order())
    print("post-order:", t.post_order())
    print(f"altura = {t.height()} | comparações para construir = {t.comparisons}")
    t.comparisons = 0
    print(f"search(58) = {t.search(58)} | comparações = {t.comparisons}")
    t.comparisons = 0
    t.delete(21)  # nó com dois filhos: o sucessor (27) assume o lugar
    assert 21 not in t.in_order() and t.size == len(chaves) - 1
    print(f"delete(21) -> in-order {t.in_order()} | comparações = {t.comparisons}\n")


def cenario_borda() -> None:
    """Cenário 2: árvore vazia, duplicata e remoções especiais."""
    print("=== Cenário 2: casos de borda ===")
    t = BST()
    print(f"vazia: search(1) = {t.search(1)}, altura = {t.height()}, in-order = {t.in_order()}")
    assert not t.search(1) and t.height() == -1 and t.in_order() == []
    t.insert(10)
    duplicada = t.insert(10)  # chave repetida deve ser recusada
    print(f"insert(10) de novo -> {duplicada} (duplicata ignorada), size = {t.size}")
    assert duplicada is False and t.size == 1
    t = build([50, 30, 70, 20, 40, 60, 80])
    print(f"delete(99) inexistente -> {t.delete(99)}")
    t.delete(50)  # remove a raiz, que tem dois filhos
    assert t.root.key == 60 and t.in_order() == [20, 30, 40, 60, 70, 80]
    print(f"delete(50) raiz -> pre-order {t.pre_order()} (nova raiz = {t.root.key})\n")


def cenario_pior_caso(n: int = 200) -> None:
    """Cenário 3: inserção aleatória O(log n) vs ordenada (degenerada) O(n)."""
    print(f"=== Cenário 3: pior caso, n = {n} ===")
    keys = list(range(n))
    aleatoria = keys[:]
    random.Random(42).shuffle(aleatoria)
    for nome, ordem in (("aleatória", aleatoria), ("ordenada ", keys)):
        t = build(ordem)
        construcao = t.comparisons
        if ordem is keys:  # pior caso: cada inserção percorre toda a "lista"
            assert construcao == n * (n - 1) // 2 and t.height() == n - 1
        t.comparisons = 0
        t.search(max(ordem))  # busca pela última chave inserida/maior chave
        print(
            f"inserção {nome}: altura = {t.height():3d} | "
            f"comparações construção = {construcao:5d} | busca(maior) = {t.comparisons}"
        )
    print(f"(ordenada: n(n-1)/2 = {n * (n - 1) // 2} comparações, altura n-1 = {n - 1})")


if __name__ == "__main__":
    cenario_comum()
    cenario_borda()
    cenario_pior_caso()
