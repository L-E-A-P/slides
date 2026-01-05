# Guida alle Slide Remark.js
## LAZZARO IN RIPRESA DI VENTI

## Struttura dei File

- `mb-presentation.html` - File HTML principale
- `presentation-style.css` - Foglio di stile esterno

## Funzionalità Implementate

### 1. Footer Personalizzato

Il footer è gestito tramite CSS e appare automaticamente in ogni slide:

- **Destra**: numero della slide (gestito da Remark)
- **Sinistra**: informazioni custom (data, titolo evento)

**Per modificare il footer sinistro**, apri `presentation-style.css` e modifica questa sezione:

```css
.remark-slide-content::after {
  content: "LAZZARO IN RIPRESA DI VENTI • Goethe-Institut Rom, 22.09.2025";
  /* ... */
}
```

Cambia il `content` con il testo desiderato.

### 2. Margine Superiore Ridotto

Il padding superiore delle slide è impostato a `3rem` (invece dei default `4rem`):

```css
.remark-slide-content {
  padding: 3rem 4rem 4rem 4rem;
}
```

Puoi ridurlo ulteriormente modificando il primo valore.

### 3. A Capo nei Titoli

Per mandare a capo un titolo dove vuoi, usa `<br/>`:

```markdown
# Questo è un titolo molto lungo <br/> che va a capo esattamente qui

## E anche i sottotitoli <br/> possono andare a capo
```

### 4. Spazio tra H1 e H2

Lo spazio tra titolo principale e sottotitolo è stato ridotto:

```css
h1 {
  margin-bottom: 0.5rem;
}

h2 {
  margin-top: 0;
}
```

Puoi modificare questi valori se necessario.

## Classi di Layout Disponibili

Ogni slide può usare combinazioni di classi:

```markdown
class: left, middle
# Contenuto allineato a sinistra e centrato verticalmente

class: center, middle
# Contenuto centrato

class: left, middle, title-slide
# Slide titolo con sfondo speciale
```

## Personalizzazione Colori

I colori sono definiti come variabili CSS in `presentation-style.css`:

```css
:root {
  --color-bg: #000;           /* Sfondo nero */
  --color-text: #f5f5f5;      /* Testo bianco sporco */
  --color-accent: #d4af37;    /* Oro per accenti */
  --color-muted: #888;        /* Grigio per testo secondario */
}
```

Modifica questi valori per cambiare l'intera palette.

## Tipografia

Attualmente usa:
- **Display/Titoli**: Playfair Display (serif elegante)
- **Corpo**: Source Sans 3 (sans-serif moderna)

Per cambiarli, modifica:

```css
:root {
  --font-display: 'Playfair Display', serif;
  --font-body: 'Source Sans 3', sans-serif;
}
```

E importa i nuovi font all'inizio del CSS.

## Elementi Speciali

### Citazioni

```markdown
> Questa è una citazione
> che apparirà con stile speciale
```

### Enfasi

```markdown
Testo con _enfasi in corsivo_ e **grassetto**.
```

### Liste

```markdown
- Punto uno
- Punto due
  - Sottopunto
```

## Note Avanzate

### Footer Diversi per Slide Diverse

Se vuoi footer differenti per slide specifiche, puoi aggiungere classi custom:

Nel CSS:
```css
.slide-special::after {
  content: "Contenuto diverso per questa slide";
}
```

Nella slide:
```markdown
class: left, middle, slide-special
# Contenuto
```

### Nascondere il Footer in Slide Specifiche

Aggiungi nel CSS:
```css
.no-footer::after {
  display: none;
}

.no-footer .remark-slide-number {
  display: none;
}
```

E usa:
```markdown
class: left, middle, no-footer
# Slide senza footer
```

## Visualizzazione

Per visualizzare la presentazione:
1. Apri `mb-presentation.html` nel browser
2. Usa le frecce per navigare
3. Premi `P` per vedere le note del relatore
4. Premi `C` per aprire una finestra clonata (utile per presentazioni)

## Shortcut Tastiera

- `→` o `PgDn`: slide successiva
- `←` o `PgUp`: slide precedente  
- `P`: modalità presenter (note)
- `C`: clona presentazione
- `F`: fullscreen
- `H`: help
