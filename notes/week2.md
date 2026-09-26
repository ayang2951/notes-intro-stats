<div class="solution-visibility" data-show-solutions="true"></div>

## Sets and Operations

Sets and set operations form the foundation of probability, and many probabilistic quantities are expressed using them. It's very important to familiarize yourself with set notation.

### Sample Spaces & Events

Let's review a few basic but critical definitions first.

<div class="callout definition">
<div class="label">Definition: Sample Space</div>

For an experiment, the ***sample space*** is defined as the set of all possible outcomes of this experiment or process.

This means that the sample space is a *set* that contains *elements*, and each element is one possible outcome. The sample space is often denoted $\mathcal S$ or $\Omega$, and the elements can be denoted $\omega$.

</div>

By "experiment," we could mean an actual scientific experiment or a controlled experiment or some real-world "process." Also note that we can choose to define different sample spaces for the same "experiment": for example, during an election, we can define a sample space $\mathcal S_1$ to contain two outcomes: either "candidate A beats candidate B and wins the election" or "candidate B beats candidate A and wins the election." If we want to be more granular, we can define an alternative sample space, $\mathcal S_2$, that contains four outcomes: "candidate A beats candidate B by more than 5 percentage points," "candidate A beats candidate B by 5 or fewer percentage points," "candidate B beats candidate A by more than 5 percentage points," and "candidate B beats candidate A by 5 or fewer percentage points." We could even define $\mathcal S_3$ to contain all possible point margins: "candidate A's percentage minus candidate B's percentage," which could take positive or negative values to any decimal point of precision you want. These are all legitimate definitions of sample spaces: what we want to illustrate is that it's important to keep in mind that the experimenter can define it.

<div class="callout definition">
<div class="label">Definition: Event</div>

Let $\Omega$ be a sample space for some experiment. An event $A \subseteq \Omega$ is a subset of the sample space, and is itself a set of outcomes.

</div>

Let's take sample space $\mathcal S_2$, which contains four outcomes, as an example. An event could contain anything from zero outcomes to all of them. Let's say there is an odd number of votes and that candidates A and B are the only options. Then event $A$ defined as "there is a tie" would contain zero elements. On the other hand, event $A$ defined as "*someone* wins the election" would contain *all* elements, because in every outcome, someone does win the election. More interesting events could be defined as "candidate A wins the election" or "the winner wins by more than 5 percentage points." These contain specific subsets of the outcomes.

Let's next examine what operations can be performed on these sets.

### Operating on Sets

A bit of review, first: union, intersection, set subtraction, and complements. It's also often important to keep in mind when you're working with sets that there exists some "universe" set, the set that contains *all* the elements of *all* the events that you're considering. In a probability context, this will always be the whole sample space.

<div class="callout definition">
<div class="label">Definition: Basic Set Operations</div>

Let $\mathcal S$ be the sample space, and let $A$ and $B$ be events. Note that this means $A \subseteq \mathcal S$ and $B \subseteq \mathcal S$.

The ***union*** of $A$ and $B$, denoted $A \cup B$, is the set of all elements in either $A$ or $B$ or both.

The ***intersection*** of $A$ and $B$, denoted $A \cap B$, is the set of all elements in both $A$ and $B$.

The **set subtraction** of $B$ from $A$, denoted $A \setminus B$, is the set of all elements in $A$ but *not* in $B$. This is equivalent to writing $A \cap B^c$, which also represents "everything in $A$ that is not in $B$."

The ***complement*** of set $A$, denoted $A^c$, is the set of all elements in the sample space $\mathcal S$ but *not* in set $A$. Note that $A^c = \mathcal S \setminus A$.

</div>

Venn diagrams are a great way to help visualize and think your way through sets and set operations. Let's look at a specific example.

<div class="callout example">
<div class="label">Example: Public Transport Ridership</div>

We have a group of 100 people who must commute to work. Out of the 100, 

<ol type="i">

<li>60 of them used the bus at some point during the week, and we will call this group $A$.</li>
<li>45 of them used the subway, which we will call group $B$.</li>
<li>20 of the people did not use public transportation at all.</li>

</ol>

The following exercises should help you practice using set operations and probability.

<ol type="a">
<li>How many people *only* used the bus or *only* used the subway? Completely filling in the following Venn diagram should help.

<img src="figures/w2-commuters.png" alt="Figure-Title" style="display:block; width:90%; max-width:600px; height:auto; margin:1rem auto;"></li>

<li>Suppose we select one commuter at random out of the 100. What is the probability that they only use the bus?</li>
<li>What is the probability that the randomly selected commuter used only *one* type of public transportation for their commute?</li>
</ol>

</div>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

We should fill in the Venn diagram, computing the number in each small category.

<ol type="a">
<li>We have 100 people in total, and 20 of them used neither type of public transportation. Hence, 80 of them must have used at least one of the two. If we add 60 and 45, we get 105, which is 25 more than 80. Therefore, there must be 25 people in the intersection that we double counted. Therefore, there must be 35 people who took the bus and did *not* take the subway, and 20 people who took the subway and did *not* take the bus.

<img src="figures/w2-commuters-filled.png" alt="Figure-Title" style="display:block; width:90%; max-width:600px; height:auto; margin:1rem auto;">
</li>
<li>There are 35 people who only use the bus. Since the commuter was selected at random, the probability must be $35/100 = 7/20$.</li>
<li>We sum the number of people computed above who only took the bus or only took the subway, and we obtain 55 people. Therefore, the probability is $55/100 = 11/20$.</li>
</ol>

</div>
</details>

This principle is general. Let $\mathcal S$ be a sample space, and let $A, B$ be events on $\mathcal S$. Then

$$
\mathbb P(A \cup B) = \mathbb P(A) + \mathbb P(B) - \mathbb P(A \cap B),
$$

as can be demonstrated by the following Venn diagram.

<img src="figures/w2-union.png" alt="Figure-Title" style="display:block; width:90%; max-width:600px; height:auto; margin:1rem auto;">

The first step for computing the probability of the entire colorful area is adding the probability of the red area represented by $A$ to the probability of the blue area represented by $B$&mdash;but we double-counted the area common to both. We therefore have to subtract everything in both $A$ and $B$&mdash;which is $A \cap B$.

It's very important to distinguish between the sets and the probabilities: probability is a function on sets and the probability of each event is a number (between 0 and 1), so typical numerical operations such as addition, subtraction, multiplication, and division apply. These same operations do *not* apply to sets.

Let's look at a slightly more complicated example.


<div class="callout example">
<div class="label">Example: Public Transportation Users & Bikers</div>

Let's suppose we still have 100 commuters, but we also identify 30 of them that occasionally bike to work. We now know that, out of the 100,

<ol type="i">
<li>60 of them used the bus at some point during the week, and we will call this group $A$.</li>
<li>45 of them used the subway, which we will call group $B$.</li>
<li>As before, 25 of them used both the bus and the subway.</li>
<li>30 of them rode a bike to work, which we will call group $C$.</li>
<li>20 of them used the bus and rode a bike to work.</li>
<li>10 of them used all of the above types of transportation.</li>
<li>15 of the people did not use any of the above types of transportation.</li>
</ol>

The above information can be illustrated in the Venn diagram below.

<img src="figures/w2-commuters2.png" alt="Figure-Title" style="display:block; width:80%; max-width:600px; height:auto; margin:1rem auto;">

<ol type="a">
<li>Identify each "small category" in the Venn diagram: $A \cap (B \cup C)^c$, $B \cap (A \cup C)^c$, $C \cap (A \cup B)^c$, $(A \cap B) \cap C^c$, $(A \cap C) \cap B^c$, $(B \cap C) \cap A^c$, and $A \cap B \cap C$. Which regions do they correspond to? What does each region represent? *Hint: think about expressing the complements using set subtraction instead.* Use this information to compute the number of commuters in each of the small categories.</li>
<li>Compute the probability that a randomly selected individual used at least one of the three types of transportation. What is the general probability rule we need to use to compute the probability of the union of two or more sets? *Hint: it's called the inclusion-exclusion principle*.</li>
<li>Does the probability rule you used require that the events be independent?</li>
</ol>

</div>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

We added one additional set $C$, and no individuals actually "moved" around our Venn diagram: we simply have more information and can subdivide the individuals with more granularity.

<ol type="a">
<li>The first three sets, $A \cap (B \cup C)^c$, $B \cap (A \cup C)^c$, $C \cap (A \cup B)^c$, represent the parts of $A$, $B$, and $C$ that are not in any other set. Specifically, for $A \cap (B \cup C)^c$, we first rewrite it using set subtraction and obtain $A \setminus (B \cup C)$. We can then interpret this expression in the following way: we take everything in $B$ or $C$, then take it away from $A$. We are therefore left with everything *only* in $A$.

This is represented by the following Venn diagram.

<img src="figures/w2-only-A.png" alt="Figure-Title" style="display:block; width:80%; max-width:600px; height:auto; margin:1rem auto;">

The second three sets, $(A \cap B) \cap C^c$, $(A \cap C) \cap B^c$, $(B \cap C) \cap A^c$, represent everything in only two out of the three sets. Specifically, taking $(A \cap B) \cap C^c$, we can rewrite it using set subtraction notation to obtain $(A \cap B) \setminus C$. This means: taking everything that's in $C$ from the set of everything that is in both $A$ and $B$.

<img src="figures/w2-A-B-no-C.png" alt="Figure-Title" style="display:block; width:80%; max-width:600px; height:auto; margin:1rem auto;">

Consider the last chunk, which is $A \cap B \cap C$. This one is the simplest: it contains only elements in all three events.

<img src="figures/w2-A-B-C.png" alt="Figure-Title" style="display:block; width:80%; max-width:600px; height:auto; margin:1rem auto;">

We now fill in the Venn diagram. Specifically, you could use the following procedure: we have that $A \cap B \cap C$ has 10 individuals and $A \cap B$ has 25. Hence, the region $(A \cap B) \cap C^c$ must have 15 individuals. Similarly, we deduce that $(A \cap C) \cap B^c$ must have 10 individuals. We know that $A$ has 60 individuals total, and the size of every other small piece has been calculated, so we know that $A \setminus (B \cup C)$ must have 25 individuals. How do we fill in the smaller pieces for $B$ and $C$? This might seem difficult at first. But notice: we can compute $B \cup C$. We know that there are 25 people in $A$ that are not in $B$ or $C$, and there are 15 people that are in no group at all. We therefore calculate $25 + 15 = 40$ people in total that are not in $B$ or $C$. Therefore, $B \cup C$ must have 60 individuals. We know that there are 45 people in $B$ and 30 in $C$, and their sum is 75. Therefore, $B \cap C$ must have 15 people. 10 of them lie in the region that is further intersected with $A$, so 5 must lie in $(B \cap C) \cap A^c$. This finally gives the two remaining pieces: $B \setminus (A \cup C)$ must have 15 people, and $C \setminus (A \cup B)$ must have 5.
  
<img src="figures/w2-commuters2-filled.png" alt="Figure-Title" style="display:block; width:80%; max-width:600px; height:auto; margin:1rem auto;">
</li>
<li>If we have already calculated out everything in each small category, it remains only to sum the values and divide by 100. This should give us $85/100 = 17/20$. Note that this is an example of the complement being easier to compute: adding up all the components is more tedious than just noticing that it must be $100 - 15 = 85$.

In more generality, we can use the inclusion-exclusion principle: in terms of sets $A$, $B$, and $C$, the probability may be computed by

$$
\mathbb P(A \cup B \cup C) = \mathbb P(A) + \mathbb P(B) + \mathbb P(C) - \mathbb P(A \cap B) - \mathbb P(A \cap C) - \mathbb P(B \cap C) + \mathbb P(A \cap B \cap C).
$$

Intuitively, we're adding everything included in all three sets, realizing that we're double counting and subtracting off overlaps, then realizing that we *completely* removed the section where all *three* overlap, and adding this last category back.
<li>This probability rule does not require independence. It always holds, regardless of how the events are related to one another.</li>

</ol>

</div>
</details>

## Conditional Probability

Conditional probability is a critical building block for our future discussions.


<div class="callout definition">
<div class="label">Definition: Conditional Probability</div>

Let $\mathcal S$ be a sample space, and let $A$ and $B$ be events. Then if $\mathbb P(B) > 0$, the ***conditional probability*** of $A$ given $B$ is defined as

$$
\mathbb P(A \,|\, B) = \frac{\mathbb P(A \cap B)}{\mathbb P(B)}.
$$

</div>

Let us work through an example.

<div class="callout example">
<div class="label">Example: Delivery Alerts</div>

Suppose we have data on 400 deliveries that occurred in New York City. Let $L$ be the event that the delivery was late, and $F$ be the event that the delivery was flagged as "likely to be late" before the delivery occurred. Suppose we know that, for this group of deliveries,

$$
\mathbb P(L) = 0.20, \qquad \mathbb P(F \,|\, L) = 0.75, \qquad \mathbb P(F \,|\, L^c) = 0.25.
$$


<ol type="a">
<li>Fill in the following table using the probabilities above.

<table style="border-collapse: collapse;">
  <tr>
    <th style="border: 1px solid black; padding: 6px;"></th>
    <th style="border: 1px solid black; padding: 6px;">Late $L$</th>
    <th style="border: 1px solid black; padding: 6px;">On time $L^c$</th>
    <th style="border: 1px solid black; padding: 6px;">Total</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">Flagged $F$</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">Not flagged $F^c$</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;"><strong>Total</strong></td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;"><strong>400</strong></td>
  </tr>
</table>

</li>

<li>Compute $\mathbb P(F)$ and $\mathbb P(L \,|\, F)$. Suppose someone waiting on their package says, "An alerted delivery has a 75% chance of being late." Is this statement accurate?</li>

</ol>

</div>

Let's look at another example, this time with no probabilities given but with three additional cells filled in.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

We use the probability and conditional probability information given to answer the questions.

<ol type="a">
<li>What can we fill in first? $\mathbb P(L)$ gives us that the "total" for $L$ (meaning both flagged and not flagged) makes up 20% out of the 400 deliveries. Hence, we have that $.2 \cdot 400 = 80$ deliveries were late. Hence, 320 must have been on time. We can therefore fill in the "Total" row.

<table style="border-collapse: collapse;">
  <tr>
    <th style="border: 1px solid black; padding: 6px;"></th>
    <th style="border: 1px solid black; padding: 6px;">Late $L$</th>
    <th style="border: 1px solid black; padding: 6px;">On time $L^c$</th>
    <th style="border: 1px solid black; padding: 6px;">Total</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">Flagged $F$</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">Not flagged $F^c$</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;"><strong>Total</strong></td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">80</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">320</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;"><strong>400</strong></td>
  </tr>
</table>

What can we fill in next based on this information? The trick is to restrict our attention to specific rows and columns that the conditional probability information gives us. The second probability tells us that, out of everything in the $L$ (late) column, 75% of them were flagged. Hence, we have that $.75 \cdot 80 = 60$ deliveries were flagged out of the 80 total that were late. Hence, $80 - 60 = 20$ of them must have not been flagged. We can therefore fill in the entire first column, $L$.

<table style="border-collapse: collapse;">
  <tr>
    <th style="border: 1px solid black; padding: 6px;"></th>
    <th style="border: 1px solid black; padding: 6px;">Late $L$</th>
    <th style="border: 1px solid black; padding: 6px;">On time $L^c$</th>
    <th style="border: 1px solid black; padding: 6px;">Total</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">Flagged $F$</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">60</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">Not flagged $F^c$</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">20</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;"><strong>Total</strong></td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">80</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">320</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;"><strong>400</strong></td>
  </tr>
</table>

We do the same thing using the third probability: we have that, out of the 320 deliveries that were not late, 25% of them were flagged. We therefore have that $.25 \cdot 320 = 80$ were flagged despite ultimately being on time. Hence, $320 - 80 = 240$ were not late and were also not flagged. We therefore have the complete table. 

<table style="border-collapse: collapse;">
  <tr>
    <th style="border: 1px solid black; padding: 6px;"></th>
    <th style="border: 1px solid black; padding: 6px;">Late $L$</th>
    <th style="border: 1px solid black; padding: 6px;">On time $L^c$</th>
    <th style="border: 1px solid black; padding: 6px;">Total</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">Flagged $F$</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">60</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">80</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">140</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">Not flagged $F^c$</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">20</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">240</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">260</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;"><strong>Total</strong></td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">80</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">320</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;"><strong>400</strong></td>
  </tr>
</table>

</li>
<li> We now compute $\mathbb P(F)$ and $\mathbb P(L \,|\, F)$. Out of the $400$ deliveries total, we see that $140$ were flagged. Hence, $\mathbb P(F) = 140/400 = 7/20$. Next, out of the $140$ flagged deliveries, $60$ were actually late. Hence, $\mathbb P(L \,|\, F) = 60/140 = 3/7$. The person is wrong, then: they are saying that if a delivery is flagged, it has a probability of 0.75 of being late. In our formal notation, this is equivalent to claiming that

$$
\mathbb P(L \,|\, F) = 0.75.
$$

This is not what we computed. What the person actually should have said is, "If a delivery is late, there is a 0.75 chance that it had been flagged." This corresponds to the *other* conditional probability,

$$
\mathbb P(F \,|\, L) = 0.75.
$$
</ol>


</div>
</details>

<div class="callout example">
<div class="label">Example: Training and Job Offers</div>

Let's consider a group of 200 people who are job-hunting. Out of the 200,

<ol type="i">
<li>120 completed a training course.</li>
<li>80 received a job offer during the following month.</li>
<li>160 completed the training course, received a job offer, or both.</li>
</ol>

For every person, we have recorded whether they completed the training course and whether they received a job offer. Suppose we select one person at random. Let $T$ be the event that the selected person completed the training course, and let $O$ be the event that they received a job offer.

<ol type="a">
<li>Fill in the following table, including all row and column totals.

<table style="border-collapse: collapse;">
  <tr>
    <th style="border: 1px solid black; padding: 6px;"></th>
    <th style="border: 1px solid black; padding: 6px;">Received an offer $O$</th>
    <th style="border: 1px solid black; padding: 6px;">No offer $O^c$</th>
    <th style="border: 1px solid black; padding: 6px;">Total</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">Completed training $T$</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">120</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">Did not complete training $T^c$</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;"><strong>Total</strong></td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;"><strong>80</strong></td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;"><strong>200</strong></td>
  </tr>
</table>

</li>
<li>What is the probability that the selected person neither completed the training course nor received a job offer? What is the probability that *exactly one* of these events occurred? You should first identify which cells you will need for your calculation.</li>
<li>Compute $\mathbb P(O \,|\, T)$ and $\mathbb P(T \,|\, O)$. What do these probabilities each mean?</li>
<li>Are $T$ and $O$ independent? How does this help us answer the question of whether a person who completed the training has a higher chance of getting an offer?</li>
</ol>

</div>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

We use the partial information above to fill in the remaining cells.

<ol type="a">
  <li>This feels a bit like Sudoku. Let's fill in the two remaining "Total" cells first.
  
<table style="border-collapse: collapse;">
  <tr>
    <th style="border: 1px solid black; padding: 6px;"></th>
    <th style="border: 1px solid black; padding: 6px;">Received an offer $O$</th>
    <th style="border: 1px solid black; padding: 6px;">No offer $O^c$</th>
    <th style="border: 1px solid black; padding: 6px;">Total</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">Completed training $T$</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">120</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">Did not complete training $T^c$</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">80</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;"><strong>Total</strong></td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;"><strong>80</strong></td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">120</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;"><strong>200</strong></td>
  </tr>
</table>

To fill in the remaining cells, we will need to utilize the fact that 160 people completed the training course, received a job offer, or both. The cells in question are "$T$ and $O$", "$T^c$ and $O$", and "$T$ and $O^c$". But wait! There's something we should notice: the only cell remaining is $T^c \cap O^c$, which is the cell containing the individuals who neither completed the training course nor received an offer. We can therefore fill that in, which must be $200 - 160 = 40$.

<table style="border-collapse: collapse;">
  <tr>
    <th style="border: 1px solid black; padding: 6px;"></th>
    <th style="border: 1px solid black; padding: 6px;">Received an offer $O$</th>
    <th style="border: 1px solid black; padding: 6px;">No offer $O^c$</th>
    <th style="border: 1px solid black; padding: 6px;">Total</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">Completed training $T$</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">120</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">Did not complete training $T^c$</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">___</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">40</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">80</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;"><strong>Total</strong></td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;"><strong>80</strong></td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">120</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;"><strong>200</strong></td>
  </tr>
</table>

We can now complete the table.

<table style="border-collapse: collapse;">
  <tr>
    <th style="border: 1px solid black; padding: 6px;"></th>
    <th style="border: 1px solid black; padding: 6px;">Received an offer $O$</th>
    <th style="border: 1px solid black; padding: 6px;">No offer $O^c$</th>
    <th style="border: 1px solid black; padding: 6px;">Total</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">Completed training $T$</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">40</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">80</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">120</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">Did not complete training $T^c$</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">40</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">40</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">80</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;"><strong>Total</strong></td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;"><strong>80</strong></td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;">120</td>
    <td style="border: 1px solid black; padding: 6px; text-align: center;"><strong>200</strong></td>
  </tr>
</table>

<li> The probability that the selected person neither completed the training course nor received a job offer is $40/200 = 1/5$. This is computed using the cell containing individuals who did not do the training course or receive an offer. The probability that exactly one of events $T$ and $O$ occurred can be computed as follows: we first count the individuals who either completed the training course and did not receive an offer or did not complete the training course but did receive an offer. Summing these two cells gives us $40 + 80 = 120$ individuals. The probability is therefore $120/200 = 3/5$.

</li>
  <li>Next, we compute $\mathbb P(O \,|\, T)$ and $\mathbb P(T \,|\, O)$. Restricting to the first row, which has 120 individuals, we have that 40 of them received an offer, making $\mathbb P(O \,|\, T) = 1/3$. Restricting to the first column, which contains 80 individuals, we see that 40 of them completed the training. Hence, $\mathbb P(T \,|\, O) = 1/2$. The former conditional probability is the chance that the applicant receives an offer given that they completed a training course. The latter represents the chance that the applicant had completed training given that they received an offer.</li>
  <li>$T$ and $O$ are *not* independent. The probability of receiving an offer is $80/200 = 2/5$. The probability of the applicant having received an offer given that they completed the training course is, as calculated above, $1/3$, which is smaller than $2/5$. Thus, knowing that the applicant completed a training course "changes" the probability. An applicant who completed the training course is less likely to have received an offer than one who did not.</li>
</ol>


</div>
</details>

## Independence

Independence is a very important but also easily misunderstood concept. 

<div class="callout definition">
<div class="label">Definition: Independent Events</div>

Let $\mathcal S$ be a sample space, and let $A$ and $B$ be events. Then $A$ and $B$ are ***independent***, denoted $A \perp B$, if 

$$
\mathbb P(A \cap B) = \mathbb P(A) \cdot \mathbb P(B).
$$

</div>

### Independence and Conditional Probability

A very important property of independence can be expressed as a statement about conditional probability.

<div class="callout proposition">
<div class="label">Proposition: Independence & Conditional Probability</div>

Let $\mathcal S$ be a sample space, and let $A$ and $B$ be events. Then, if $\mathbb P(A), \mathbb P(B) > 0$, we have that $A \perp B$ if and only if

$$
\mathbb P(A \,|\, B) = \mathbb P(A), \qquad \mathbb P(B \,|\, A) = \mathbb P(B).
$$

</div>

This makes a lot of sense, intuitively. If $A$ and $B$ are independent, knowing whether event $A$ occurred gives you no information about whether event $B$ will occur. Hence, "conditioning on each other" does not change the probabilities.

### Other Properties of Independence

Independence is often confused by students with *disjointness*. These are very different concepts.

<div class="callout definition">
<div class="label">Definition: Disjoint Events</div>

Let $\mathcal S$ be a sample space, and let $A$ and $B$ be events. Then $A$ and $B$ are ***disjoint*** if 

$$
A \cap B = \emptyset. 
$$

</div>

What do we notice? We never mentioned probability at all. Disjointness is a property of the sets themselves, and independence is a property of sets when we have probabilities.

In fact, if events $A$ and $B$ both have positive probability, then if they are disjoint, they *cannot* be independent. We use the conditional probability property above to convince ourselves of this.

Again, we have that $\mathbb P(A) > 0$. Let us condition on $B$. We obtain the conditional probability

$$
\mathbb P(A \,|\, B) = \frac{\mathbb P(A \cap B)}{\mathbb P(B)} = \frac{0}{\mathbb P(B)} = 0 \neq \mathbb P(A).
$$

If we know that $B$ has happened, since $A$ and $B$ cannot simultaneously happen, we know that $A$ *cannot* have happened.

### Mutual Independence & Pairwise Independence

Suppose we have many events, $A_1, A_2, \ldots A_n$. There is a difference between the events being *pairwise* independent, meaning any selected two events are independent, and the entire collection of events being *mutually* independent, which means that they are all collectively independent from one another.

Specifically, if the collection is pairwise independent, any two selected events $A_i$ and $A_j$ satisfy

$$
\mathbb P(A_i \cap A_j) = \mathbb P(A_i) \cdot \mathbb P(A_j).
$$

However, if the collection is *mutually* independent, not only does it need to satisfy the above, but it also needs to satisfy this property: if we select *any* subset of *any* size, the probabilities need to multiply. Suppose we select events $A_{k_1}, A_{k_2} \ldots A_{k_\ell}$. Then we need that

$$
\mathbb P(A_{k_1} \cap A_{k_2} \ldots \cap A_{k_\ell}) = \mathbb P(A_{k_1}) \cdot \mathbb P(A_{k_2}) \ldots \mathbb P(A_{k_\ell}).
$$

Therefore, we can see that mutual independence is *stronger* than pairwise independence, meaning it requires more properties to hold.

Let's look at an example to make this, and the above discussion about disjointness, concrete.

<div class="callout example">
<div class="label">Example: Two Dice Rolls</div>

Suppose we have two fair six-sided dice, and we independently roll each of them. Let us define four events: let $A_1$ be the event that die 1 rolls an odd number. Let $A_2$ be the event that die 1 rolls an even number. Let $A_3$ be the event that die 2 rolls an odd number. Let $A_4$ be the event that the sum of the numbers on the two dice is odd.

<ol type="a">
  <li>Are $A_1$ and $A_2$ independent? Are they disjoint? Are $A_1$ and $A_3$ independent? Are $A_2$ and $A_3$?</li>
  <li>Are $A_1$ and $A_4$ independent? You might need to calculate out the conditional probabilities.</li>
  <li>Are $A_2$, $A_3$, and $A_4$ pairwise independent? Are they mutually independent?</li>
</ol>

</div>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

This requires some careful thinking.

<ol type="a">
  <li>$A_1$ and $A_2$ are clearly not independent. They are disjoint: if I know that $A_1$ has occurred, that means that the first die rolled an odd number, and therefore cannot have rolled an even number. $A_1$ and $A_3$ are independent: the outcome of one dice roll does not impact the outcome of another. Similarly, $A_2$ and $A_3$ are also independent, as they are events for two independently rolled dice.</li>
  <li>$A_1$ and $A_4$ are indeed independent. We can directly and explicitly count the outcomes. Let's first calculate what the probabilities for the two events themselves are.

  What is the probability that die 1 rolls an odd number? Three out of six equally probable outcomes are odd, so the probability is $1/2$. This is true for die 2 as well.
  
  What is the probability that the sum of the two numbers is odd? If both numbers are even or both numbers are odd, the sum is even. These two outcomes both have probability $(1/2) \cdot (1/2) = 1/4$. Summing them gives $1/2$ again. Then we already know the probability that the sum is an odd number is $1/2$, but let's compute it anyway: if the first number is even and the second is odd, then we have that the sum is odd. Similarly, if the first number is odd and the second is even, we also have that the sum is odd. Both of these also have a probability of $(1/2) \cdot (1/2) = 1/4$, and summing them also gives $1/2$.
  
  Now we calculate the conditional probability. Suppose that $A_1$ has occurred, meaning the first die rolled an odd number. What is the probability that the sum is odd? In order for $A_4$ to occur, $A_3^c$ must occur, meaning the second die needs to be even. This has probability $1/2$ of occurring. Therefore, the conditional probability $\mathbb P(A_4 \,|\, A_1) = 1/2 = \mathbb P(A_4)$.
  
  Similarly, one can compute that $\mathbb P(A_1 \,|\, A_4) = \mathbb P(A_1)$. We have that $\mathbb P(A_1) = 1/2$. Knowing that the sum is odd gives us that either die 1 rolled an even number and die 2 odd, or the other way around. These two events have equal probability, so we have that $\mathbb P(A_1 \,|\, A_4) = 1/2$ as well. Hence, $A_1 \perp A_4$.</li>
  <li>We can easily compute that $A_2 \perp A_4$ and $A_3 \perp A_4$ in exactly the same way as above. $A_2$ is also independent of $A_3$, as they concern the outcomes of independent dice rolls. Hence, every pair we can choose from $A_2, A_3, A_4$ is independent, and we may conclude that this collection of events is pairwise independent.
  
  Are they mutually independent? It turns out that they are not. Suppose we know that events $A_2$ and $A_3$ both occurred. That means that $A_4$ *must* have occurred: if we already know that die 1 was even and die 2 was odd, then the sum must be odd. Therefore, while $\mathbb P(A_4) = 1/2$, we have that $\mathbb P(A_4 \,|\, A_2, A_3) = 1$. Similarly, if we know that event $A_2$ occurred but that event $A_3$ did *not* occur, we know that the sum must be even, and $A_4$ cannot occur. Therefore, the events are not mutually independent.</li>
</ol>

</div>
</details>



<!--

<img src="figures/name.png" alt="Figure-Title" style="display:block; width:40%; max-width:600px; height:auto; margin:1rem auto;">



<div class="callout definition">
<div class="label">Definition: Object to Define</div>

Here is the definition. Here is the list of required properties:

<ol type="i">
  <li>property 1.</li>
  <li>property 2.</li>
  <li>property 3.</li>
</ol>

</div>

We now introduce a proposition.

<div class="callout proposition">
<div class="label">Proposition: Property to Define</div>

Here is the proposition. *This only holds under the described circumstances*. ***We truly want to emphasize this.***

</div>

<details class="collapsible">
<summary>Proof</summary>
<div class="collapsible__content">

Here is the proof of the above proposition.

<details class="collapsible">
<summary>Proof of the sub-proposition</summary>
<div class="collapsible__content">

Here is the sub-proof.

</div>
</details>

</div>
</details>


-->