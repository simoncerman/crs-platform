# 📖 Bakalářská práce - LaTeX

## Struktura

```
/thesis
├── main.tex              # Hlavní soubor - kompiluj tento
├── metadata.tex          # Metadata (jméno, vedoucí, datum)
├── titlepage.tex         # Titulní stránka
├── declaration.tex       # Čestné prohlášení
├── bibliography.bib      # Zdroje (BibTeX)
├── /chapters            # Kapitoly (boilerplate - postupně doplňovat)
│   ├── 01_uvod.tex
│   ├── 02_analyza.tex
│   ├── 03_navrh.tex
│   ├── 04_implementace.tex
│   ├── 05_testovani.tex
│   ├── 06_zaver.tex
│   └── appendix.tex
├── /images              # Obrázky, diagramy, screenshoty
└── /listings            # Code snippets
```

## Kompilace

### VS Code + LaTeX Workshop (doporučeno)

1. Rozšíření **LaTeX Workshop** již nainstalováno
2. Otevři `main.tex`
3. Stiskni `Cmd+Option+B` nebo ulož soubor (Cmd+S)
4. PDF se vygeneruje automaticky a otevře v editoru

### Manuální kompilace (terminál)

```bash
cd thesis

# Nastavení PATH pro MacTeX
export PATH="/usr/local/texlive/2025/bin/universal-darwin:$PATH"

# Kompilace s bibliografií
pdflatex -interaction=nonstopmode main.tex
biber main
pdflatex -interaction=nonstopmode main.tex

# Otevření PDF
open main.pdf
```

## Struktura kapitol (podle vzorové struktury FIM UHK)

Kapitoly jsou připraveny jako **čistý boilerplate** s komentáři, co kam doplnit:

1. **Úvod** - Motivace, struktura práce
2. **Cíl a metodika** + **Teoretická část** - Definice cílů, metodika, analýza domény, rozbor technologií
3. **Návrh řešení** - Architektura, datový model, API, bezpečnost
4. **Implementace** - Vývojové prostředí, struktura, klíčové funkcionality
5. **Testování** - Metodika, scénáře, výsledky
6. **Závěr** - Splnění cílů, diskuse, budoucí rozvoj

## TODO

- [ ] Postupně doplňovat obsah kapitol
- [ ] Přidat diagramy do `/images/`
- [ ] Přidat code snippety do `/listings/`
- [ ] Doplnit metadata v `metadata.tex` (studentské ID)
- [ ] Rozšířit `bibliography.bib` o další zdroje
- [ ] Vyplnit všechny TODO komentáře v kapitolách
- [ ] Přidat obrázky z Figma do `/images`
- [ ] Vytvořit code snippety do `/listings`
- [ ] Exportovat diagramy z `/docs/architecture` do `/images`
- [ ] Doplnit kompletní bibliografii do `bibliography.bib`
- [ ] Přidat screenshoty implementované aplikace
- [ ] Doplnit výsledky testování
- [ ] Review a korektury textu

## Poznámky

- Všechny kapitoly mají připravenou strukturu s TODO komentáři
- Kostra práce odpovídá struktuře bakalářské práce na UHK
- Čestné prohlášení obsahuje sekci o použití AI nástrojů
- Použit balíček `biblatex` pro bibliografii (ISO 690 norma)
- Nastavení českého jazyka pomocí `babel`

## Užitečné příkazy

```latex
% Odkaz na obrázek
\ref{fig:architecture}

% Odkaz na kapitolu
\ref{chap:analyza}

% Citace
\cite{gamma1994design}

% Vložení obrázku
\begin{figure}[h]
  \centering
  \includegraphics[width=0.8\textwidth]{diagram.png}
  \caption{Popis obrázku}
  \label{fig:diagram}
\end{figure}

% Vložení kódu ze souboru
\lstinputlisting[language=JavaScript]{listings/example.js}

% Inline kód
\lstinline|const x = 5;|
```
