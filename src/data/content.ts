// Contenus statiques (fiches, methode, ressources) - rendus via <RichText/>.

export const FICHES_HTML = `<div class="card">
      <h3>Numération & conversions</h3>
      <ul>
        <li>Binaire→décimal : somme des puissances de 2. Ex. <code>111001</code> = 32+16+8+1 = <b>57</b>.</li>
        <li>Décimal→binaire : divisions successives par 2, on lit les restes de bas en haut.</li>
        <li>Hexadécimal : 1 chiffre hexa = 4 bits. A=10, B=11, C=12, D=13, E=14, F=15.</li>
        <li>Décimal→hexa : divisions par 16. Ex. <code>10217</code> = <b>27E9</b>₁₆.</li>
        <li>Octal : 1 chiffre octal = 3 bits.</li>
      </ul>
    </div>
    <div class="card">
      <h3>Réseaux - sous-réseautage (classe C)</h3>
      <p><code>192.168.28.0</code> appartient à la plage <b>privée</b> 192.168.0.0/16 (RFC 1918) : c'est une question d'usage, pas de classe. Dans le <b>modèle classful historique</b>, son 1er octet (192, compris entre 192 et 223) la range en <b>classe C</b>, masque par défaut <code>/24</code> - c'est la convention attendue à l'examen. En <b>CIDR</b> (pratique actuelle), la classe ne joue plus : seul le masque explicite compte. Découper en 3 sous-réseaux revient à emprunter <b>2 bits</b> (2² = 4 ≥ 3).</p>
      <ul>
        <li>Masque : <code>255.255.255.192</code> (/26)</li>
        <li>Sous-réseaux : 4 · Hôtes/sous-réseau : 2⁶−2 = <b>62</b></li>
        <li>Pas d'incrément : 64 → blocs .0 / .64 / .128 / .192</li>
        <li>4ᵉ sous-réseau : .192 → hôtes <b>.193 à .254</b>, broadcast .255</li>
      </ul>
      <p class="muted">Classes : A = 1-126 · B = 128-191 · C = 192-223. Masques par défaut /8, /16, /24.</p>
    </div>
    <div class="card">
      <h3>Architecture des ordinateurs</h3>
      <ul>
        <li>Von Neumann = <b>SISD</b> (Single Instruction Single Data), programme et données en mémoire commune.</li>
        <li>Mémoire cache : principe de <b>localité de référence</b> (règle 90-10).</li>
        <li>Hiérarchie mémoire : Registres &gt; Cache &gt; RAM &gt; Disque.</li>
        <li>Unités : 1 Ko=1024 o, 1 Mo=1024 Ko, 1 Go, 1 To, Po, Eo, Zo, <b>Yo</b> (la plus grande ici).</li>
        <li>GUI = <b>Graphical User Interface</b>.</li>
      </ul>
    </div>
    <div class="card">
      <h3>UML</h3>
      <ul>
        <li>Cas d'utilisation = <b>acteurs</b> + fonctionnalités. Relations : include, extend, généralisation.</li>
        <li>Diagramme de classes : classe = attributs + méthodes. Associations avec <b>multiplicités</b> (1, 0..1, 1..*, *).</li>
        <li>Héritage = flèche triangle vide. Composition = losange plein. Agrégation = losange vide.</li>
      </ul>
    </div>
    <div class="card">
      <h3>Bases de données - passage MCD → relationnel</h3>
      <ul>
        <li>Entité → table, identifiant → <b>clé primaire</b>.</li>
        <li>Association <b>1,n</b> → la clé du côté « 1 » migre comme <b>clé étrangère</b> côté « n ».</li>
        <li>Association <b>n,n</b> → nouvelle table portant les deux clés (clé composée) + attributs de l'association.</li>
      </ul>
    </div>
    <div class="card">
      <h3>SQL - squelette</h3>
      <p><code>SELECT</code> cols <code>FROM</code> t1 <code>JOIN</code> t2 <code>ON</code> … <code>WHERE</code> … <code>GROUP BY</code> … <code>HAVING</code> … <code>ORDER BY</code> …</p>
      <ul>
        <li>Agrégats : <code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code>, <code>MAX</code> (souvent avec GROUP BY).</li>
        <li>Création : <code>CREATE TABLE</code> · Insertion : <code>INSERT INTO</code> · Contraintes : PRIMARY KEY, FOREIGN KEY.</li>
      </ul>
    </div>
    <div class="card">
      <h3>POO (Java / C++)</h3>
      <ul>
        <li>4 piliers : <b>Encapsulation, Héritage, Polymorphisme, Abstraction</b>.</li>
        <li>Java : tableau d'entiers → <code>int[] t = new int[5];</code> · tri → <code>Arrays.sort()</code>.</li>
        <li>Interface : méthodes abstraites (public par défaut), pas d'implémentation (avant Java 8).</li>
        <li>C++ : classes avec <code>public/private/protected</code>, constructeurs, <code>::</code>, pointeurs.</li>
      </ul>
    </div>
    <div class="card">
      <h3>PHP · HTML/CSS/Bootstrap</h3>
      <ul>
        <li>PHP : balises <code>&lt;?php ?&gt;</code>, variables <code>$x</code>, superglobales <code>$_GET/$_POST/$_SESSION</code>, <code>echo</code>.</li>
        <li>HTML : structure sémantique, formulaire <code>&lt;form method&gt;</code>, attribut <code>action</code>.</li>
        <li>CSS sélecteurs : <code>#id</code>, <code>.classe</code>, balise. Boîte : margin/border/padding/content.</li>
        <li>Bootstrap : grille <code>container &gt; row &gt; col-*</code> (12 colonnes), classes utilitaires responsives.</li>
      </ul>
    </div>`;

export const METHOD_HTML = `<div class="card">
      <h3>Programme type d'une journée (≈ 6 h)</h3>
      <p class="muted">Deux blocs (matin/après-midi) avec pauses de 10 min toutes les 50 min (méthode Pomodoro).</p>
      <table>
        <tr><th>Créneau</th><th>Durée</th><th>Activité</th></tr>
        <tr><td>Bloc 1 - Cours</td><td>45 min</td><td>Relire la fiche express + notes du thème du jour</td></tr>
        <tr><td>Bloc 1 - Quiz</td><td>45 min</td><td>Onglet Quiz du thème, puis correction et carnet d'erreurs</td></tr>
        <tr><td>Bloc 1 - Exercices faciles/moyens</td><td>60 min</td><td>2-3 exercices ouverts du thème (sans le corrigé)</td></tr>
        <tr><td>- Pause déjeuner -</td><td>-</td><td></td></tr>
        <tr><td>Bloc 2 - Exercice difficile</td><td>60 min</td><td>1 gros sujet type-examen, rédigé entièrement</td></tr>
        <tr><td>Bloc 2 - Ancienne épreuve</td><td>75 min</td><td>Un dossier d'une vraie épreuve, en conditions</td></tr>
        <tr><td>Bloc 2 - Reprise</td><td>30 min</td><td>Refaire les questions ratées + relire le carnet d'erreurs</td></tr>
      </table>
      <p class="muted">Total ≈ 6 h. Le thème du jour suit l'onglet « Plan J-24 ».</p>
    </div>
    <div class="card">
      <h3>Comment atteindre la maîtrise totale</h3>
      <ul>
        <li>Ne passe au thème suivant qu'une fois le quiz réussi à <b>≥ 80 %</b> et l'exercice difficile rédigé sans le corrigé.</li>
        <li>Fais <b>chaque exercice trois fois</b> sur le cycle : découverte → reprise J+3 → contrôle J+7.</li>
        <li>Chaque niveau compte : commence par les exercices « Facile », finis par « Difficile » avant de valider un thème.</li>
        <li>Un thème n'est « maîtrisé » que si tu peux refaire l'exercice difficile <b>de mémoire</b>, sans notes.</li>
      </ul>
    </div>
    <div class="card">
      <h3>Les 5 principes</h3>
      <ul>
        <li><b>Espacement</b> : chaque thème est revu 2 fois (apprentissage puis reprise J+7 à J+10).</li>
        <li><b>Test avant tout</b> : se tester fait plus mémoriser que relire.</li>
        <li><b>Examens blancs</b> chronométrés (2 h) pour l'endurance et la gestion du temps.</li>
        <li><b>Carnet d'erreurs</b> : chaque faute = 1 ligne « question / bonne réponse / pourquoi ».</li>
        <li><b>Priorité au rentable</b> : subnetting, SQL, UML et conversions rapportent beaucoup de points sûrs.</li>
      </ul>
    </div>
    <div class="card">
      <h3>Barème mental le jour J</h3>
      <p>Commence par les QCM et les questions à points sûrs (conversions, réseaux, SQL). Garde les exercices
        longs (diagramme de classes, code) pour un bloc dédié. Ne laisse aucune case QCM vide s'il n'y a pas de
        point négatif.</p>
    </div>`;

export const LIENS_HTML = `<div class="card">
      <ul>
        <li>QCM PHP 7 - <a href="https://www.qcmquiz.com/QUESTIONNAIRES/QCM-PHP7.php" target="_blank" rel="noopener">qcmquiz.com/QCM-PHP7</a></li>
        <li>QCM (réponses) - <a href="https://www.qcmquiz.com/QCMreponses.php" target="_blank" rel="noopener">qcmquiz.com/QCMreponses</a></li>
        <li>QCM Framework Spring - <a href="https://waytolearnx.com/2018/12/qcm-framework-spring-partie-1.html" target="_blank" rel="noopener">waytolearnx.com - Spring</a></li>
        <li>Documentation Bootstrap 4.1 - <a href="https://getbootstrap.com/docs/4.1/getting-started/introduction/" target="_blank" rel="noopener">getbootstrap.com/docs/4.1</a></li>
      </ul>
      <p class="muted">Anciennes épreuves dans ce dossier : Tronc Commun 2018, 2019, 2022, 2023, 2024 · Spécialité 2019, 2022, 2023. Refais-les en conditions réelles (2 h, sans notes) comme examens blancs.</p>
    </div>`;
