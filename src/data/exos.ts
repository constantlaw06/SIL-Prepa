import type { Exo } from "@/lib/types";

export const EXOS: Exo[] = [
  {
    cat: "Réseaux",
    diff: "15 min",
    titre: "Sous-réseautage d'un réseau de classe C",
    enonce: `Un centre informatique dispose du réseau IP <code>192.168.28.0</code>. On souhaite le subdiviser en <b>3 sous-réseaux</b>.
  <ol>
   <li>Donne la classe de cette adresse IP.</li>
   <li>Indique le nombre de bits à emprunter.</li>
   <li>Indique le nombre total de sous-réseaux exploitables.</li>
   <li>Indique le nombre d'hôtes par sous-réseau.</li>
   <li>Donne le masque de sous-réseau.</li>
   <li>Donne l'étendue des adresses hôtes du 4ᵉ sous-réseau utilisable.</li>
  </ol>`,
    corrige: `<ol>
   <li><b>Classe C</b> (1ᵉʳ octet = 192, compris entre 192 et 223 ; masque par défaut /24).</li>
   <li>Il faut 3 sous-réseaux. 2¹=2 &lt; 3, 2²=4 ≥ 3 → on emprunte <b>2 bits</b> sur la partie hôte.</li>
   <li>Nombre de sous-réseaux = 2² = <b>4</b> (tous exploitables avec le sous-réseautage moderne).</li>
   <li>Bits hôtes restants = 8 − 2 = 6 → hôtes par sous-réseau = 2⁶ − 2 = <b>62</b> (on retire l'adresse réseau et le broadcast).</li>
   <li>Masque = /24 + 2 = <b>/26</b> = <b>255.255.255.192</b>.</li>
   <li>Incrément = 256 − 192 = 64. Blocs : .0 | .64 | .128 | <b>.192</b>.
     4ᵉ sous-réseau = 192.168.28.192 → adresses hôtes de <b>192.168.28.193 à 192.168.28.254</b>, broadcast = 192.168.28.255.</li>
  </ol>`,
  },

  {
    cat: "UML",
    diff: "30 min",
    titre: "Modélisation d'un centre de formation",
    enonce: `Un centre de formation organise des sessions pour des clients. Un client peut consulter (sans se connecter) le catalogue et discuter avec un téléconseiller. Il peut s'inscrire pour être informé, s'inscrire à une session, et annuler tant que la session n'a pas commencé. Une inscription génère une ou plusieurs factures éditées par un téléconseiller et payées par le client. Le responsable de formation réalise toutes les actions d'un téléconseiller et édite en plus des statistiques de relance.
  <ol>
   <li>Identifie les acteurs du système.</li>
   <li>Cite 5 cas d'utilisation.</li>
   <li>Dégage 5 règles de gestion (de domaine) du texte.</li>
   <li>Propose les classes principales avec leurs associations.</li>
  </ol>`,
    corrige: `<h5>1. Acteurs</h5>
  <ul><li><b>Client</b> (acteur principal)</li><li><b>Téléconseiller</b></li>
  <li><b>Responsable de formation</b> - hérite du téléconseiller (généralisation d'acteur)</li></ul>
  <h5>2. Cas d'utilisation</h5>
  <ul><li>Consulter le catalogue de formations</li><li>Discuter avec un téléconseiller</li>
  <li>S'inscrire à une session</li><li>Annuler une inscription</li><li>Éditer / payer une facture</li>
  <li>(Responsable) Éditer des statistiques de relance</li></ul>
  <h5>3. Règles de gestion</h5>
  <ol><li>Un client peut consulter le catalogue sans se connecter.</li>
  <li>Un client ne peut annuler que tant que la session n'a pas commencé.</li>
  <li>Une inscription donne lieu à une ou plusieurs factures.</li>
  <li>Une facture est éditée par un téléconseiller et payée par le client.</li>
  <li>Le responsable de formation réalise toutes les actions d'un téléconseiller.</li></ol>
  <h5>4. Classes principales</h5>
  <pre>Client (id, titre, nom, prénoms, email, téléphone, dateNaiss, sexe)
Adresse (ville, boitePostale)            Client *--1 Adresse
Session (dateDémarrage, prix, langue)    Session 1--* Inscription
Inscription (dateCréation, dateAnnul, remise, présence)
Facture (montant, datePaiement)          Inscription 1--* Facture
Cours (intitulé, domaine, dateCréation)  Cours 1--* Session
Formateur (nom, prénom, niveau)          Formateur 1--* Session</pre>
  <p class="muted">Multiplicités clés : un Client passe 0..* Inscriptions ; une Inscription concerne 1 Session et génère 1..* Factures.</p>`,
  },

  {
    cat: "BD / SQL",
    diff: "30 min",
    titre: "Du modèle entité-association au SQL (gestion de vols)",
    enonce: `On dispose du modèle : <b>AVION</b>(NumA, Constructeur, Modele) - <b>COMPAGNIE</b>(NomC) - <b>VOL</b>(NumV, Jour, HeureDepart, HeureArrivee, PlacesLibres) - <b>PERSONNEL</b>(NomPE, Fonction) - <b>PASSAGER</b>(NomPA) - <b>AEROPORT</b>(NomA) - <b>VILLE</b>(NomV). Un avion appartient à une compagnie ; un avion effectue plusieurs vols ; un vol part d'un aéroport et arrive à un autre ; un passager réserve des vols (date de réservation).
  <ol>
   <li>Traduis ce modèle en modèle relationnel (tables + clés).</li>
   <li>Écris le SQL pour : (a) créer la table VOL ; (b) la liste des passagers du vol 'AF3487' ; (c) la moyenne du nombre de passagers par avion ; (d) les compagnies ayant effectué au moins un vol vers Libreville.</li>
  </ol>`,
    corrige: `<h5>1. Modèle relationnel</h5>
  <pre>COMPAGNIE(NomC)
AVION(NumA, Constructeur, Modele, #NomC)
AEROPORT(NomA, #NomV)
VILLE(NomV)
VOL(NumV, Jour, HeureDepart, HeureArrivee, PlacesLibres,
    #NumA, #AeroDepart, #AeroArrivee)
PASSAGER(NomPA)
RESERVER(#NumV, #NomPA, DateReservation)   -- association n,n
TRAVAILLER(#NomPE, #NomC)                   -- personnel/compagnie</pre>
  <p class="muted">Une association 1,n → la clé du côté 1 migre côté n. Une association n,n (réserver) → table dédiée à clé composée.</p>
  <h5>2. Requêtes SQL</h5>
  <pre>-- a) créer la table VOL
CREATE TABLE VOL(
  NumV        VARCHAR(10) PRIMARY KEY,
  Jour        DATE,
  HeureDepart TIME,
  HeureArrivee TIME,
  PlacesLibres INT,
  NumA        INT,
  FOREIGN KEY (NumA) REFERENCES AVION(NumA)
);

-- b) passagers du vol AF3487
SELECT P.NomPA
FROM PASSAGER P
JOIN RESERVER R ON P.NomPA = R.NomPA
WHERE R.NumV = 'AF3487';

-- c) moyenne du nombre de passagers par avion
SELECT AVG(nb) AS moyenne
FROM ( SELECT V.NumA, COUNT(R.NomPA) AS nb
       FROM VOL V JOIN RESERVER R ON V.NumV = R.NumV
       GROUP BY V.NumA ) t;

-- d) compagnies ayant un vol vers Libreville
SELECT DISTINCT C.NomC
FROM COMPAGNIE C
JOIN AVION A   ON A.NomC = C.NomC
JOIN VOL V     ON V.NumA = A.NumA
JOIN AEROPORT AE ON V.AeroArrivee = AE.NomA
JOIN VILLE VI  ON AE.NomV = VI.NomV
WHERE VI.NomV = 'Libreville';</pre>`,
  },

  {
    cat: "POO Java",
    diff: "25 min",
    titre: "Classe Article (import et taxes)",
    enonce: `Un magasin importe ses articles. Un article est caractérisé par son code (<code>codeArticle</code>), sa marque (<code>marque</code>) et son prix hors taxe (<code>prixHorsTaxe</code>). Le prix de transport représente <b>5 %</b> du prix HT et la taxe douanière <b>18 %</b>. Écris une classe Java qui définit l'article avec : le constructeur adéquat, la méthode <code>prixTransport()</code>, la méthode <code>taxeDouaniere()</code>, et la méthode <code>prixMinVente()</code> sachant que le propriétaire gagne <b>75 %</b> du prix d'achat.`,
    corrige: `<pre>public class Article {
    private String codeArticle;
    private String marque;
    private double prixHorsTaxe;

    // Constructeur
    public Article(String codeArticle, String marque, double prixHorsTaxe) {
        this.codeArticle  = codeArticle;
        this.marque       = marque;
        this.prixHorsTaxe = prixHorsTaxe;
    }

    // 5 % du prix HT
    public double prixTransport() {
        return 0.05 * prixHorsTaxe;
    }

    // 18 % du prix HT
    public double taxeDouaniere() {
        return 0.18 * prixHorsTaxe;
    }

    // prix d'achat total puis marge de 75 %
    public double prixMinVente() {
        double prixAchat = prixHorsTaxe + prixTransport() + taxeDouaniere();
        return prixAchat * 1.75;   // +75 % de bénéfice
    }
}</pre>
  <p class="muted">Points notés : encapsulation (attributs private), constructeur qui initialise via <code>this</code>, réutilisation des méthodes dans <code>prixMinVente()</code>.</p>`,
  },

  {
    cat: "POO C++",
    diff: "25 min",
    titre: "Classe CompteBancaire en C++",
    enonce: `Écris en C++ une classe <code>CompteBancaire</code> avec les attributs privés <code>titulaire</code> (string) et <code>solde</code> (double). Prévois : un constructeur, une méthode <code>deposer(double)</code>, une méthode <code>retirer(double)</code> qui refuse si le solde est insuffisant, et une méthode <code>afficher()</code>.`,
    corrige: `<pre>#include &lt;iostream&gt;
#include &lt;string&gt;
using namespace std;

class CompteBancaire {
private:
    string titulaire;
    double solde;

public:
    CompteBancaire(string t, double s = 0.0) {
        titulaire = t;
        solde = s;
    }

    void deposer(double montant) {
        if (montant > 0) solde += montant;
    }

    void retirer(double montant) {
        if (montant &lt;= solde)
            solde -= montant;
        else
            cout &lt;&lt; "Solde insuffisant !" &lt;&lt; endl;
    }

    void afficher() {
        cout &lt;&lt; "Titulaire : " &lt;&lt; titulaire
             &lt;&lt; " | Solde : " &lt;&lt; solde &lt;&lt; endl;
    }
};

int main() {
    CompteBancaire c("Awa", 100);
    c.deposer(50);
    c.retirer(200);   // -> Solde insuffisant
    c.retirer(120);
    c.afficher();     // -> Solde : 30
    return 0;
}</pre>`,
  },

  {
    cat: "PHP",
    diff: "20 min",
    titre: "Formulaire d'inscription + traitement",
    enonce: `Crée une page HTML avec un formulaire (nom, email, mot de passe) envoyé en <b>POST</b> vers <code>traitement.php</code>. Écris <code>traitement.php</code> qui : vérifie que les champs ne sont pas vides, valide le format de l'email, et affiche un message de bienvenue (ou les erreurs).`,
    corrige: `<h5>inscription.html</h5>
  <pre>&lt;form action="traitement.php" method="post"&gt;
  &lt;input type="text"     name="nom"    placeholder="Nom"&gt;
  &lt;input type="email"    name="email"  placeholder="Email"&gt;
  &lt;input type="password" name="mdp"    placeholder="Mot de passe"&gt;
  &lt;button type="submit"&gt;S'inscrire&lt;/button&gt;
&lt;/form&gt;</pre>
  <h5>traitement.php</h5>
  <pre>&lt;?php
$erreurs = [];
$nom   = trim($_POST['nom']   ?? '');
$email = trim($_POST['email'] ?? '');
$mdp   = $_POST['mdp'] ?? '';

if ($nom === '')                                    $erreurs[] = "Nom obligatoire.";
if (!filter_var($email, FILTER_VALIDATE_EMAIL))     $erreurs[] = "Email invalide.";
if (strlen($mdp) &lt; 6)                               $erreurs[] = "Mot de passe trop court.";

if (empty($erreurs)) {
    echo "Bienvenue " . htmlspecialchars($nom) . " !";
} else {
    foreach ($erreurs as $e) echo "&lt;p&gt;$e&lt;/p&gt;";
}
?&gt;</pre>
  <p class="muted">À retenir : <code>$_POST</code>, <code>filter_var(... FILTER_VALIDATE_EMAIL)</code>, et <code>htmlspecialchars()</code> contre l'injection HTML.</p>`,
  },

  {
    cat: "Excel",
    diff: "20 min",
    titre: "Feuille POINT - formules de paie",
    enonce: `D'après la feuille GRILLE (primes par service/grade) et la feuille AGENT, remplis la feuille POINT. Règles : RG1 - la prime dépend du grade et du service. RG2 - retenue de 10 000 pour les hommes. RG3 - pour les femmes : 3 % du salaire de base si &gt; 3 enfants, sinon 5 %. Le salaire de base est en cellule fixe (ex. G2 = 250 000).
  <ol><li>Écris la formule de la <b>Prime</b> (colonne E).</li>
  <li>Écris la formule de la <b>Retenue</b> (colonne F).</li>
  <li>Écris la formule du <b>Salaire net</b> (colonne G).</li>
  <li>Compte le nombre d'agents bénéficiant de plus de 40 000 de prime.</li></ol>`,
    corrige: `<pre>-- Hypothèses : Sexe en colonne (…), NbEnfants en (…),
-- salaire de base fixe en $G$2.

1) Prime (recherche croisée service + grade dans GRILLE) :
   =INDEX(GRILLE!$C$4:$E$6 ; EQUIV(Service ; GRILLE!$A$4:$A$6 ; 0)
                          ; EQUIV(Grade   ; GRILLE!$C$2:$E$2 ; 0))

2) Retenue :
   =SI(Sexe="M" ; 10000 ;
        SI(NbEnfants>3 ; 3%*$G$2 ; 5%*$G$2))

3) Salaire net :
   = $G$2 + Prime - Retenue        (soit  =$G$2 + E4 - F4)

4) Nombre d'agents avec prime > 40 000 :
   =NB.SI(E4:E13 ; ">40000")</pre>
  <p class="muted">Fonctions clés : <code>SI</code> imbriqué, <code>INDEX/EQUIV</code> (ou <code>RECHERCHEV</code>), <code>NB.SI</code>, et références absolues <code>$G$2</code>.</p>`,
  },

  {
    cat: "Numération",
    diff: "10 min",
    titre: "Série de conversions",
    enonce: `Effectue les conversions suivantes en montrant la démarche :
  <ol><li><code>110110</code>₂ → décimal</li>
  <li>212 (décimal) → binaire</li>
  <li>212 (décimal) → hexadécimal</li>
  <li><code>3AF</code>₁₆ → décimal</li>
  <li><code>10110101</code>₂ → hexadécimal (par groupes de 4 bits)</li></ol>`,
    corrige: `<ol>
   <li><code>110110</code>₂ = 32+16+0+4+2+0 = <b>54</b>.</li>
   <li>212 → 212=128+64+16+4 → 11010100. Vérif : 128+64+16+4=212 → <b>11010100</b>₂.</li>
   <li>212 / 16 = 13 reste 4 ; 13 / 16 = 0 reste 13 (D) → <b>D4</b>₁₆.</li>
   <li><code>3AF</code> = 3×256 + 10×16 + 15 = 768+160+15 = <b>943</b>.</li>
   <li><code>1011 0101</code> → 1011=B, 0101=5 → <b>B5</b>₁₆.</li>
  </ol>`,
  },

  {
    cat: "Architecture",
    diff: "10 min",
    titre: "Circuit logique - table de vérité",
    enonce: `Soit la fonction <code>S = (A ET B) OU (NON A ET C)</code>.
  <ol><li>Dresse la table de vérité de S pour A, B, C.</li>
  <li>Combien de lignes comporte la table pour 3 variables ?</li></ol>`,
    corrige: `<li>Nombre de lignes = 2³ = <b>8</b>.</li>
  <pre>A B C | A·B | ¬A·C | S
0 0 0 |  0  |  0   | 0
0 0 1 |  0  |  1   | 1
0 1 0 |  0  |  0   | 0
0 1 1 |  0  |  1   | 1
1 0 0 |  0  |  0   | 0
1 0 1 |  0  |  0   | 0
1 1 0 |  1  |  0   | 1
1 1 1 |  1  |  0   | 1</pre>
  <p class="muted">S vaut 1 quand (A et B) sont vrais, ou quand A est faux et C vrai.</p>`,
  },

  {
    cat: "Numération",
    diff: "15 min · Moyen",
    titre: "Complément à 2 (nombres signés)",
    enonce: `<ol><li>Représente <b>−25</b> en complément à 2 sur 8 bits.</li>
  <li>Le mot binaire signé <code>11101011</code> (8 bits, complément à 2) vaut combien en décimal ?</li>
  <li>Quel est l'intervalle des entiers représentables en complément à 2 sur 8 bits ?</li></ol>`,
    corrige: `<ol>
   <li>25 = <code>00011001</code>. On inverse → <code>11100110</code>, puis +1 → <b>11100111</b> = −25.</li>
   <li>Bit de signe = 1 → négatif. On inverse <code>11101011</code> → <code>00010100</code>, +1 → <code>00010101</code> = 21. Donc valeur = <b>−21</b>.</li>
   <li>De −2⁷ à 2⁷−1, soit <b>−128 à +127</b>.</li>
  </ol>`,
  },

  {
    cat: "Numération",
    diff: "10 min · Facile",
    titre: "Opérations arithmétiques binaires",
    enonce: `Effectue en binaire (et vérifie en décimal) :
  <ol><li><code>1011</code> + <code>0110</code></li><li><code>1101</code> − <code>0111</code></li><li><code>101</code> × <code>11</code></li></ol>`,
    corrige: `<ol>
   <li>1011 (11) + 0110 (6) = <b>10001</b> (17).</li>
   <li>1101 (13) − 0111 (7) = <b>0110</b> (6).</li>
   <li>101 (5) × 11 (3) = <b>1111</b> (15).</li>
  </ol>`,
  },

  {
    cat: "Numération",
    diff: "15 min · Difficile",
    titre: "Algèbre de Boole - simplification",
    enonce: `<ol><li>Simplifie <code>F = A·B + A·B̄</code>.</li>
  <li>Simplifie <code>G = A + Ā·B</code>.</li>
  <li>Une fonction vaut 1 pour les minterms Σ(1,3,5,7) sur (A,B,C). Donne l'expression simplifiée.</li></ol>`,
    corrige: `<ol>
   <li>F = A·(B+B̄) = A·1 = <b>A</b>.</li>
   <li>G = A + Ā·B = (A+Ā)·(A+B) = <b>A + B</b> (théorème d'absorption).</li>
   <li>1=001, 3=011, 5=101, 7=111 : tous ont C=1 → <b>F = C</b>.</li>
  </ol>`,
  },

  {
    cat: "Architecture",
    diff: "15 min · Moyen",
    titre: "Demi-additionneur et additionneur complet",
    enonce: `<ol><li>Donne les équations logiques d'un <b>demi-additionneur</b> (entrées A, B ; sorties S et retenue C).</li>
  <li>Donne les équations d'un <b>additionneur complet</b> (entrées A, B, Cₑ ; sorties S et Cₛ).</li></ol>`,
    corrige: `<ol>
   <li>Demi-additionneur : <b>S = A ⊕ B</b> ; <b>C = A·B</b>.</li>
   <li>Additionneur complet : <b>S = A ⊕ B ⊕ Cₑ</b> ; <b>Cₛ = A·B + Cₑ·(A ⊕ B)</b> (retenue si au moins 2 entrées à 1).</li>
  </ol>`,
  },

  {
    cat: "Architecture",
    diff: "15 min · Moyen",
    titre: "Capacité mémoire et bus d'adresse",
    enonce: `<ol><li>Un processeur possède un bus d'adresse de <b>16 bits</b> et un mot mémoire de 1 octet. Quelle est la taille maximale adressable ?</li>
  <li>Combien de lignes d'adresse faut-il pour adresser une mémoire de <b>4 K</b> mots ?</li>
  <li>Quelle est la capacité, en octets, d'une mémoire organisée en <b>4K × 8</b> ?</li></ol>`,
    corrige: `<ol>
   <li>2¹⁶ = 65 536 = <b>64 Ko</b> adressables.</li>
   <li>4 K = 4096 = 2¹² → il faut <b>12 lignes d'adresse</b>.</li>
   <li>4096 mots × 8 bits = 4096 octets = <b>4 Ko</b>.</li>
  </ol>`,
  },

  {
    cat: "Architecture",
    diff: "15 min · Difficile",
    titre: "Performance de la mémoire cache",
    enonce: `Une cache a un temps d'accès de <b>10 ns</b>, la mémoire centrale <b>100 ns</b>. Le taux de succès (hit ratio) est de <b>90 %</b>.
  <ol><li>Calcule le temps d'accès moyen.</li><li>Que devient-il si le taux passe à 95 % ?</li></ol>`,
    corrige: `<p>Tmoy = h·Tcache + (1−h)·Tmémoire.</p>
  <ol><li>Tmoy = 0,90×10 + 0,10×100 = 9 + 10 = <b>19 ns</b>.</li>
   <li>Tmoy = 0,95×10 + 0,05×100 = 9,5 + 5 = <b>14,5 ns</b> → la localité améliore nettement les performances.</li></ol>`,
  },

  {
    cat: "Réseaux",
    diff: "25 min · Difficile",
    titre: "VLSM - sous-réseaux de tailles différentes",
    enonce: `Le réseau <code>192.168.1.0/24</code> doit accueillir 3 sous-réseaux : <b>A = 50 hôtes</b>, <b>B = 20 hôtes</b>, <b>C = 10 hôtes</b>. Attribue à chacun son bloc (adresse réseau, masque, plage, broadcast) en gaspillant le moins d'adresses possible.`,
    corrige: `<p>On commence par le plus grand (VLSM) :</p>
  <pre>A (50 hôtes) : /26 -> 62 hôtes
   Réseau 192.168.1.0/26   | hôtes .1 à .62   | broadcast .63
B (20 hôtes) : /27 -> 30 hôtes
   Réseau 192.168.1.64/27  | hôtes .65 à .94  | broadcast .95
C (10 hôtes) : /28 -> 14 hôtes
   Réseau 192.168.1.96/28  | hôtes .97 à .110 | broadcast .111</pre>
  <p class="muted">Règle : bits hôtes n tels que 2ⁿ−2 ≥ besoin. 50→6 bits (/26), 20→5 bits (/27), 10→4 bits (/28).</p>`,
  },

  {
    cat: "Réseaux",
    diff: "15 min · Moyen",
    titre: "Adresse réseau et broadcast à partir d'une IP",
    enonce: `Soit l'hôte <code>172.16.20.200</code> avec le masque <code>/21</code>.
  <ol><li>Donne le masque en décimal pointé.</li><li>Donne l'adresse du réseau.</li>
  <li>Donne l'adresse de broadcast.</li><li>Donne la plage d'adresses hôtes utilisables.</li></ol>`,
    corrige: `<ol>
   <li>/21 → <b>255.255.248.0</b>.</li>
   <li>Bloc du 3ᵉ octet = 256−248 = 8 → multiples de 8 : …16, 24… 200 est dans le bloc où le 3ᵉ octet = 16 (16 ≤ 20 &lt; 24). Réseau = <b>172.16.16.0</b>.</li>
   <li>Broadcast = <b>172.16.23.255</b> (dernier du bloc 16→23).</li>
   <li>Hôtes utilisables : <b>172.16.16.1 → 172.16.23.254</b> (2 046 hôtes).</li>
  </ol>`,
  },

  {
    cat: "Réseaux",
    diff: "15 min · Facile",
    titre: "Modèle OSI - couches et protocoles",
    enonce: `<ol><li>Cite les 7 couches du modèle OSI dans l'ordre.</li>
  <li>Associe à sa couche : IP, TCP, HTTP, Ethernet, UDP, FTP.</li>
  <li>Quelle est la différence essentielle entre TCP et UDP ?</li></ol>`,
    corrige: `<ol>
   <li>1-Physique, 2-Liaison, 3-Réseau, 4-Transport, 5-Session, 6-Présentation, 7-Application.</li>
   <li>Ethernet → Liaison(2) ; IP → Réseau(3) ; TCP et UDP → Transport(4) ; HTTP et FTP → Application(7).</li>
   <li><b>TCP</b> = orienté connexion, fiable (accusés, ordre garanti). <b>UDP</b> = sans connexion, rapide, non fiable.</li>
  </ol>`,
  },

  {
    cat: "UML",
    diff: "20 min · Moyen",
    titre: "Diagramme de séquence - authentification",
    enonce: `Décris le diagramme de séquence de la connexion d'un utilisateur : il saisit login/mot de passe dans l'IHM, un contrôleur vérifie auprès de la base, et selon le résultat affiche l'accueil ou un message d'erreur. Liste les messages et le fragment alternatif.`,
    corrige: `<pre>Utilisateur -> IHM        : saisir(login, mdp)
IHM         -> Controleur : authentifier(login, mdp)
Controleur  -> BD         : SELECT * FROM users WHERE login=?
BD          --> Controleur : résultat
alt [identifiants valides]
   Controleur --> IHM : succès
   IHM        --> Utilisateur : afficher page d'accueil
else [invalides]
   Controleur --> IHM : échec
   IHM        --> Utilisateur : afficher "login/mdp incorrect"
end</pre>
  <p class="muted">Objets = lignes de vie ; messages synchrones (flèche pleine), retours (pointillés) ; le bloc <code>alt</code> gère les deux cas.</p>`,
  },

  {
    cat: "UML",
    diff: "15 min · Moyen",
    titre: "Diagramme d'états - cycle de vie d'une commande",
    enonce: `Modélise le diagramme d'états-transitions d'une commande en ligne, depuis sa création jusqu'à la livraison, avec possibilité d'annulation.`,
    corrige: `<pre>[*] -> Créée
Créée    -> Validée   : valider()
Validée  -> Payée     : payer()
Payée    -> Expédiée  : expédier()
Expédiée -> Livrée    : livrer()
Livrée   -> [*]
Créée    -> Annulée   : annuler()
Validée  -> Annulée   : annuler()
Annulée  -> [*]</pre>
  <p class="muted">États = rectangles arrondis ; transitions déclenchées par des événements/actions ; une commande ne peut plus être annulée après paiement.</p>`,
  },

  {
    cat: "UML",
    diff: "25 min · Difficile",
    titre: "Cas d'utilisation + classes - bibliothèque",
    enonce: `Une bibliothèque gère le prêt de livres. Un adhérent recherche un livre, l'emprunte (max 3 à la fois, 15 jours), le retourne, ou le réserve s'il est indisponible. Le bibliothécaire enregistre les retours et gère le catalogue.
  <ol><li>Acteurs et 4 cas d'utilisation.</li><li>Classes principales avec associations et multiplicités.</li></ol>`,
    corrige: `<h5>Acteurs & cas d'utilisation</h5>
  <ul><li>Acteurs : <b>Adhérent</b>, <b>Bibliothécaire</b>.</li>
  <li>UC : Rechercher un livre · Emprunter un exemplaire · Retourner un exemplaire · Réserver un livre · (Bibliothécaire) Gérer le catalogue.</li></ul>
  <h5>Classes</h5>
  <pre>Livre (isbn, titre, auteur)            1 --- 1..* Exemplaire
Exemplaire (codeExemplaire, état)      1 --- 0..* Emprunt
Adhérent (numAdh, nom, email)          1 --- 0..* Emprunt
Emprunt (dateEmprunt, dateRetourPrévue, dateRetourRéelle)
Réservation (dateRésa)   Adhérent 1---0..* Réservation *---1 Livre</pre>
  <p class="muted">Règle de gestion : un adhérent a au plus 3 emprunts en cours ; un exemplaire a un seul emprunt actif.</p>`,
  },

  {
    cat: "BD / SQL",
    diff: "25 min · Difficile",
    titre: "Normalisation 1FN → 3FN",
    enonce: `Soit la table brute : <code>COMMANDE(numCmd, dateCmd, numClient, nomClient, numProduit, libellé, prixU, qté)</code> où une commande contient plusieurs produits.
  <ol><li>Pourquoi n'est-elle pas en 1FN ? Corrige.</li>
  <li>Mets en 2FN.</li><li>Mets en 3FN. Donne le schéma final.</li></ol>`,
    corrige: `<ol>
   <li><b>1FN</b> : un attribut multivalué (plusieurs produits par commande). On éclate en lignes atomiques, clé = (numCmd, numProduit).</li>
   <li><b>2FN</b> : dépendances partielles - <code>libellé, prixU</code> dépendent de numProduit seul ; <code>dateCmd, numClient, nomClient</code> dépendent de numCmd seul. On sépare.</li>
   <li><b>3FN</b> : <code>nomClient</code> dépend de numClient (transitive via numCmd) → table CLIENT à part.</li>
  </ol>
  <pre>CLIENT(numClient, nomClient)
PRODUIT(numProduit, libellé, prixU)
COMMANDE(numCmd, dateCmd, #numClient)
LIGNE_CMD(#numCmd, #numProduit, qté)   -- clé composée</pre>`,
  },

  {
    cat: "BD / SQL",
    diff: "20 min · Moyen",
    titre: "Concevoir un MCD à partir d'un énoncé",
    enonce: `Dans une école : un étudiant s'inscrit à plusieurs cours ; un cours est enseigné par un seul professeur mais un professeur enseigne plusieurs cours ; pour chaque cours suivi, l'étudiant obtient une note. Propose le modèle entité-association (entités, associations, cardinalités) puis le relationnel.`,
    corrige: `<h5>MCD</h5>
  <pre>ÉTUDIANT (numEt, nom, prénom)
PROFESSEUR (numProf, nom)
COURS (numCours, intitulé)
PROFESSEUR (1,n) --- Enseigner --- (1,1) COURS
ÉTUDIANT (0,n) --- Suivre[note] --- (0,n) COURS</pre>
  <h5>Relationnel</h5>
  <pre>PROFESSEUR(numProf, nom)
COURS(numCours, intitulé, #numProf)
ÉTUDIANT(numEt, nom, prénom)
SUIVRE(#numEt, #numCours, note)   -- association n,n porteuse d'attribut</pre>`,
  },

  {
    cat: "BD / SQL",
    diff: "35 min · Difficile",
    titre: "SQL progressif - Employés / Départements",
    enonce: `Schéma : <code>EMP(numE, nom, salaire, poste, #numDept, #numChef)</code> et <code>DEPT(numDept, nomDept, ville)</code>. Écris les requêtes :
  <ol><li>Tous les employés triés par salaire décroissant.</li>
  <li>Salaire moyen par département.</li>
  <li>Départements ayant plus de 3 employés.</li>
  <li>Employés gagnant plus que le salaire moyen global.</li>
  <li>Employés sans chef.</li>
  <li>Nombre d'employés par ville.</li>
  <li>Départements n'ayant aucun employé.</li>
  <li>Augmenter de 10 % les salaires du département 'Informatique'.</li></ol>`,
    corrige: `<pre>-- 1
SELECT * FROM EMP ORDER BY salaire DESC;

-- 2
SELECT numDept, AVG(salaire) FROM EMP GROUP BY numDept;

-- 3
SELECT numDept, COUNT(*) FROM EMP
GROUP BY numDept HAVING COUNT(*) > 3;

-- 4
SELECT nom, salaire FROM EMP
WHERE salaire > (SELECT AVG(salaire) FROM EMP);

-- 5
SELECT nom FROM EMP WHERE numChef IS NULL;

-- 6
SELECT D.ville, COUNT(E.numE)
FROM DEPT D JOIN EMP E ON E.numDept = D.numDept
GROUP BY D.ville;

-- 7
SELECT D.nomDept FROM DEPT D
LEFT JOIN EMP E ON E.numDept = D.numDept
WHERE E.numE IS NULL;

-- 8
UPDATE EMP SET salaire = salaire * 1.10
WHERE numDept = (SELECT numDept FROM DEPT WHERE nomDept = 'Informatique');</pre>`,
  },

  {
    cat: "POO Java",
    diff: "25 min · Moyen",
    titre: "Héritage et polymorphisme - formes géométriques",
    enonce: `Crée une classe abstraite <code>Forme</code> avec une méthode abstraite <code>aire()</code>. Dérive <code>Cercle</code> et <code>Rectangle</code>. Dans un <code>main</code>, mets plusieurs formes dans un tableau et affiche la somme des aires (polymorphisme).`,
    corrige: `<pre>abstract class Forme {
    abstract double aire();
}
class Cercle extends Forme {
    double r;
    Cercle(double r){ this.r = r; }
    double aire(){ return Math.PI * r * r; }
}
class Rectangle extends Forme {
    double L, l;
    Rectangle(double L, double l){ this.L = L; this.l = l; }
    double aire(){ return L * l; }
}
public class Test {
    public static void main(String[] a){
        Forme[] formes = { new Cercle(2), new Rectangle(3, 4) };
        double total = 0;
        for (Forme f : formes) total += f.aire();  // polymorphisme
        System.out.println("Aire totale = " + total);
    }
}</pre>
  <p class="muted">Le type déclaré est <code>Forme</code>, l'appel <code>f.aire()</code> exécute la version de la vraie classe (liaison dynamique).</p>`,
  },

  {
    cat: "POO Java",
    diff: "25 min · Moyen",
    titre: "Interface + collection (ArrayList)",
    enonce: `Définis une interface <code>Comparable</code>-like ou utilise <code>Comparable&lt;Etudiant&gt;</code> : classe <code>Etudiant(nom, moyenne)</code>. Stocke des étudiants dans une <code>ArrayList</code> et trie-les par moyenne décroissante.`,
    corrige: `<pre>import java.util.*;

class Etudiant implements Comparable&lt;Etudiant&gt; {
    String nom; double moyenne;
    Etudiant(String n, double m){ nom = n; moyenne = m; }
    public int compareTo(Etudiant e){
        return Double.compare(e.moyenne, this.moyenne); // décroissant
    }
    public String toString(){ return nom + " (" + moyenne + ")"; }
}
public class Main {
    public static void main(String[] a){
        ArrayList&lt;Etudiant&gt; liste = new ArrayList&lt;&gt;();
        liste.add(new Etudiant("Awa", 14));
        liste.add(new Etudiant("Koffi", 17));
        liste.add(new Etudiant("Lina", 12));
        Collections.sort(liste);
        System.out.println(liste);
    }
}</pre>`,
  },

  {
    cat: "POO Java",
    diff: "20 min · Difficile",
    titre: "Gestion des exceptions",
    enonce: `Écris une méthode <code>diviser(int a, int b)</code> qui lève et gère la division par zéro, puis crée ta propre exception <code>SoldeInsuffisantException</code> utilisée par une méthode <code>retirer</code>.`,
    corrige: `<pre>class SoldeInsuffisantException extends Exception {
    SoldeInsuffisantException(String m){ super(m); }
}
public class Banque {
    static int diviser(int a, int b){
        try { return a / b; }
        catch (ArithmeticException e){
            System.out.println("Division par zéro !");
            return 0;
        }
    }
    double solde = 100;
    void retirer(double m) throws SoldeInsuffisantException {
        if (m > solde) throw new SoldeInsuffisantException("Solde insuffisant");
        solde -= m;
    }
    public static void main(String[] a){
        System.out.println(diviser(10, 0));
        Banque b = new Banque();
        try { b.retirer(200); }
        catch (SoldeInsuffisantException e){ System.out.println(e.getMessage()); }
    }
}</pre>`,
  },

  {
    cat: "POO C++",
    diff: "25 min · Difficile",
    titre: "Surcharge d'opérateur - nombres complexes",
    enonce: `Crée une classe <code>Complexe(re, im)</code> en C++ et surcharge l'opérateur <code>+</code> pour additionner deux complexes, ainsi qu'une méthode d'affichage.`,
    corrige: `<pre>#include &lt;iostream&gt;
using namespace std;

class Complexe {
    double re, im;
public:
    Complexe(double r = 0, double i = 0){ re = r; im = i; }
    Complexe operator+(const Complexe&amp; c){
        return Complexe(re + c.re, im + c.im);
    }
    void afficher(){ cout &lt;&lt; re &lt;&lt; " + " &lt;&lt; im &lt;&lt; "i" &lt;&lt; endl; }
};
int main(){
    Complexe a(3, 4), b(1, 2);
    Complexe c = a + b;   // appelle operator+
    c.afficher();         // 4 + 6i
    return 0;
}</pre>`,
  },

  {
    cat: "POO C++",
    diff: "20 min · Moyen",
    titre: "Héritage et méthode virtuelle",
    enonce: `Classe de base <code>Animal</code> avec méthode virtuelle <code>crier()</code>. Dérive <code>Chien</code> et <code>Chat</code>. Montre le polymorphisme via un pointeur <code>Animal*</code>.`,
    corrige: `<pre>#include &lt;iostream&gt;
using namespace std;

class Animal {
public:
    virtual void crier(){ cout &lt;&lt; "..." &lt;&lt; endl; }
};
class Chien : public Animal {
public:
    void crier() override { cout &lt;&lt; "Ouaf" &lt;&lt; endl; }
};
class Chat : public Animal {
public:
    void crier() override { cout &lt;&lt; "Miaou" &lt;&lt; endl; }
};
int main(){
    Animal* a = new Chien();
    a->crier();          // Ouaf (liaison dynamique grâce à 'virtual')
    a = new Chat();
    a->crier();          // Miaou
    return 0;
}</pre>
  <p class="muted">Sans le mot-clé <code>virtual</code>, c'est la méthode de la classe de base qui serait appelée.</p>`,
  },

  {
    cat: "PHP",
    diff: "25 min · Moyen",
    titre: "Authentification avec sessions",
    enonce: `Écris <code>login.php</code> qui vérifie un couple utilisateur/mot de passe, ouvre une session, puis <code>accueil.php</code> qui protège la page, et <code>logout.php</code> qui détruit la session.`,
    corrige: `<pre>// login.php
&lt;?php
session_start();
$users = ['admin' =&gt; 'secret'];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $u = $_POST['user']; $p = $_POST['pass'];
    if (isset($users[$u]) &amp;&amp; $users[$u] === $p) {
        $_SESSION['user'] = $u;
        header('Location: accueil.php');
    } else { echo "Identifiants invalides"; }
}
?&gt;

// accueil.php
&lt;?php
session_start();
if (!isset($_SESSION['user'])) { header('Location: login.php'); exit; }
echo "Bienvenue " . $_SESSION['user'];
?&gt;

// logout.php
&lt;?php
session_start();
session_destroy();
header('Location: login.php');
?&gt;</pre>
  <p class="muted">En production : mots de passe hachés avec <code>password_hash()</code> / <code>password_verify()</code>.</p>`,
  },

  {
    cat: "PHP",
    diff: "30 min · Difficile",
    titre: "CRUD avec PDO / MySQL",
    enonce: `Connecte-toi à une base MySQL avec PDO, puis écris une insertion sécurisée (requête préparée) et une lecture de tous les produits.`,
    corrige: `<pre>&lt;?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=boutique;charset=utf8',
                   'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // INSERT sécurisé (requête préparée -> anti-injection)
    $req = $pdo->prepare(
        "INSERT INTO produit (nom, prix) VALUES (:nom, :prix)");
    $req->execute([':nom' =&gt; 'Clavier', ':prix' =&gt; 25.5]);

    // SELECT
    $liste = $pdo->query("SELECT * FROM produit")->fetchAll();
    foreach ($liste as $p) {
        echo $p['nom'] . " : " . $p['prix'] . "&lt;br&gt;";
    }
} catch (PDOException $e) {
    echo "Erreur : " . $e->getMessage();
}
?&gt;</pre>`,
  },

  {
    cat: "PHP",
    diff: "15 min · Facile",
    titre: "Manipulation de tableaux et de chaînes",
    enonce: `<ol><li>Découpe la chaîne <code>"php,html,css,sql"</code> en tableau et affiche le nombre d'éléments.</li>
  <li>Parcours un tableau associatif <code>['Awa'=>15,'Koffi'=>12]</code> et affiche « nom : note ».</li>
  <li>Mets une chaîne en majuscules et donne sa longueur.</li></ol>`,
    corrige: `<pre>&lt;?php
// 1
$t = explode(",", "php,html,css,sql");
echo count($t);                 // 4

// 2
$notes = ['Awa' =&gt; 15, 'Koffi' =&gt; 12];
foreach ($notes as $nom =&gt; $note) {
    echo "$nom : $note&lt;br&gt;";
}

// 3
$s = "licence";
echo strtoupper($s);            // LICENCE
echo strlen($s);                // 7
?&gt;</pre>`,
  },

  {
    cat: "Web",
    diff: "25 min · Moyen",
    titre: "Mise en page HTML/CSS avec Flexbox",
    enonce: `Réalise une page avec un en-tête, une barre de navigation horizontale, un contenu à deux colonnes (menu latéral + article) et un pied de page, en utilisant <b>Flexbox</b>.`,
    corrige: `<pre>&lt;!DOCTYPE html&gt;
&lt;html lang="fr"&gt;&lt;head&gt;&lt;meta charset="UTF-8"&gt;
&lt;style&gt;
  body{margin:0;font-family:sans-serif}
  header,footer{background:#333;color:#fff;padding:1rem;text-align:center}
  nav{display:flex;gap:1rem;background:#eee;padding:.5rem}
  .main{display:flex}
  aside{flex:1;background:#f4f4f4;padding:1rem}
  article{flex:3;padding:1rem}
&lt;/style&gt;&lt;/head&gt;&lt;body&gt;
  &lt;header&gt;Mon site&lt;/header&gt;
  &lt;nav&gt;&lt;a href="#"&gt;Accueil&lt;/a&gt;&lt;a href="#"&gt;Cours&lt;/a&gt;&lt;/nav&gt;
  &lt;div class="main"&gt;
    &lt;aside&gt;Menu&lt;/aside&gt;
    &lt;article&gt;Contenu principal&lt;/article&gt;
  &lt;/div&gt;
  &lt;footer&gt;© 2026&lt;/footer&gt;
&lt;/body&gt;&lt;/html&gt;</pre>
  <p class="muted"><code>display:flex</code> aligne les enfants ; <code>flex:1</code> vs <code>flex:3</code> répartit la largeur (1/4 et 3/4).</p>`,
  },

  {
    cat: "Web",
    diff: "20 min · Moyen",
    titre: "Bootstrap - navbar et cartes responsives",
    enonce: `Avec Bootstrap, crée une barre de navigation et une rangée de 3 cartes qui passent sur une seule colonne en mobile.`,
    corrige: `<pre>&lt;link href="bootstrap.min.css" rel="stylesheet"&gt;

&lt;nav class="navbar navbar-expand-lg navbar-dark bg-dark"&gt;
  &lt;a class="navbar-brand" href="#"&gt;Logo&lt;/a&gt;
&lt;/nav&gt;

&lt;div class="container mt-4"&gt;
  &lt;div class="row"&gt;
    &lt;div class="col-12 col-md-4"&gt;
      &lt;div class="card"&gt;&lt;div class="card-body"&gt;Carte 1&lt;/div&gt;&lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="col-12 col-md-4"&gt;
      &lt;div class="card"&gt;&lt;div class="card-body"&gt;Carte 2&lt;/div&gt;&lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="col-12 col-md-4"&gt;
      &lt;div class="card"&gt;&lt;div class="card-body"&gt;Carte 3&lt;/div&gt;&lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</pre>
  <p class="muted"><code>col-12</code> = pleine largeur (mobile) ; <code>col-md-4</code> = 3 colonnes dès la taille md (4+4+4=12).</p>`,
  },

  {
    cat: "Excel",
    diff: "20 min · Moyen",
    titre: "RECHERCHEV et fonctions conditionnelles",
    enonce: `Une feuille TARIF contient (A2:B6) des codes produits et leurs prix. Dans une facture, à partir d'un code saisi en D2 :
  <ol><li>Affiche le prix correspondant.</li><li>Applique une remise de 10 % si la quantité (E2) &gt; 100.</li>
  <li>Gère le cas d'un code introuvable.</li></ol>`,
    corrige: `<pre>1) Prix :
   =RECHERCHEV(D2 ; TARIF!$A$2:$B$6 ; 2 ; FAUX)

2) Prix après remise :
   =SI(E2>100 ; Prix*0.9 ; Prix)
   soit : =SI(E2>100 ;
             RECHERCHEV(D2;TARIF!$A$2:$B$6;2;FAUX)*0.9 ;
             RECHERCHEV(D2;TARIF!$A$2:$B$6;2;FAUX))

3) Code introuvable :
   =SIERREUR(RECHERCHEV(D2;TARIF!$A$2:$B$6;2;FAUX) ; "Code inconnu")</pre>
  <p class="muted">4ᵉ argument <code>FAUX</code> = correspondance exacte ; <code>$</code> = références absolues à la table.</p>`,
  },

  {
    cat: "Excel",
    diff: "15 min · Facile",
    titre: "Fonctions statistiques conditionnelles",
    enonce: `Une plage AGENTS a le service en colonne A, le sexe en B, le salaire en C (lignes 2 à 20).
  <ol><li>Somme des salaires du service 'SI'.</li><li>Nombre de femmes du service 'SC'.</li>
  <li>Salaire moyen des hommes.</li></ol>`,
    corrige: `<pre>1) =SOMME.SI(A2:A20 ; "SI" ; C2:C20)

2) =NB.SI.ENS(A2:A20 ; "SC" ; B2:B20 ; "F")

3) =MOYENNE.SI(B2:B20 ; "M" ; C2:C20)</pre>`,
  },

  {
    cat: "Algorithmique",
    diff: "20 min · Moyen",
    titre: "Tri à bulles et recherche",
    enonce: `<ol><li>Écris en pseudocode l'algorithme du <b>tri à bulles</b> d'un tableau T de n entiers.</li>
  <li>Écris la <b>recherche dichotomique</b> d'une valeur x dans un tableau trié.</li></ol>`,
    corrige: `<pre>// 1) Tri à bulles
pour i de 0 à n-2 faire
   pour j de 0 à n-2-i faire
      si T[j] > T[j+1] alors
         échanger T[j] et T[j+1]
      finsi
   finpour
finpour

// 2) Recherche dichotomique (T trié croissant)
deb <- 0 ; fin <- n-1
tantque deb <= fin faire
   mil <- (deb + fin) / 2
   si T[mil] = x alors retourner mil
   sinon si T[mil] < x alors deb <- mil + 1
   sinon fin <- mil - 1
   finsi
fintantque
retourner -1   // non trouvé</pre>
  <p class="muted">Tri à bulles : complexité O(n²). Dichotomie : O(log n), nécessite un tableau trié.</p>`,
  },

  {
    cat: "Algorithmique",
    diff: "15 min · Facile",
    titre: "Factorielle - itérative et récursive",
    enonce: `Écris la fonction factorielle de deux façons : itérative (boucle) et récursive, en pseudocode ou en langage de ton choix.`,
    corrige: `<pre>// Itérative
fonction factIter(n) :
   r <- 1
   pour i de 2 à n faire
      r <- r * i
   finpour
   retourner r

// Récursive
fonction factRec(n) :
   si n <= 1 alors retourner 1
   sinon retourner n * factRec(n-1)
   finsi</pre>
  <p class="muted">Cas de base indispensable en récursif (n ≤ 1) pour arrêter les appels.</p>`,
  },
];
