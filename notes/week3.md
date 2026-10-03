<div class="solution-visibility" data-show-solutions="true"></div>

## Conditional Probability (cont.)

Recall the definition of conditional probability from last week.

<div class="callout definition">
<div class="label">Definition: Conditional Probability</div>

Let $\mathcal S$ be a sample space, and let $A$ and $B$ be events. Then if $\mathbb P(B) > 0$, the ***conditional probability*** of $A$ given $B$ is defined as

$$
\mathbb P(A \,|\, B) = \frac{\mathbb P(A \cap B)}{\mathbb P(B)}.
$$

</div>

We will introduce two very important results that can frequently be used together to solve problems.

<div class="callout theorem">
<div class="label">Theorem: Bayes' Rule</div>

Let $A, B$ be events with nonzero probability. Then ***Bayes' rule*** states that

$$
\mathbb P(A \,|\, B) = \frac{\mathbb P(B \,|\, A)\cdot \mathbb P(A)}{\mathbb P(B)}.
$$

</div>

<details class="collapsible">
<summary>Proof</summary>
<div class="collapsible__content">

From the definition of conditional probability, since $\mathbb P(A), \mathbb P(B) > 0$, we have that

$$
\mathbb P(B \,|\, A) = \frac{\mathbb P(B \cap A)}{\mathbb P(A)}.
$$

Moving $\mathbb P(A)$ to the left-hand side gives that $\mathbb P(B \cap A) = \mathbb P(B \,|\, A) \cdot \mathbb P(A)$. Since intersection is commutative, we have that $\mathbb P(B \cap A) = \mathbb P(A \cap B)$, and we may substitute the latter into the definition of $\mathbb P(A \,|\, B)$ to obtain the result.

</div>
</details>

This theorem allows us to "switch" between the two conditional probabilities. 

The second important result allows us to compute an unconditional probability using many conditional probabilities.

<div class="callout theorem">
<div class="label">Theorem: Law of Total Probability</div>

Let $\Omega$ be a sample space. Let $\{B_i\}_{i = 1}^n$ be a *partition* of $\Omega$: this means that 

$$
B_i \cap B_j = \emptyset \text{ for any } i \neq j, \qquad \bigcup_{i = 1}^n B_i = \Omega.
$$

In essence, this means that we break apart the entire space into non-overlapping pieces $B_1, B_2, \ldots, B_n$. Further suppose that $\mathbb P(B_i) > 0$ for each $B_i$.

For any event $A$, the ***law of total probability*** states that

$$
\mathbb P(A) = \sum_{i = 1}^n \mathbb P(A \,|\, B_i) \cdot \mathbb P(B_i).
$$

</div>

<details class="collapsible">
<summary>Proof</summary>
<div class="collapsible__content">

First, notice that, since all the $B_i$ are disjoint and their union is the entire space $\Omega$, we have that

$$
\bigcup_{i = 1}^n \,(A \cap B_i) = A \cap \left(\bigcup_{i = 1}^n B_i \right) = A \cap \Omega = A.
$$

The first equality holds by the distributive law on sets, the second because $\{B_i\}_{i = 1}^n$ is a partition of $\Omega$, and the last because $A \subseteq \Omega$.

Next, because $\{B_i\}_{i = 1}^n$ is a partition, the sets $\{A\cap B_i\}_{i = 1}^n$ are disjoint. Hence, we have by finite additivity that

$$
\mathbb P\left(\bigcup_{i = 1}^n \, (A \cap B_i)\right) = \sum_{i = 1}^n \mathbb P(A \cap B_i).
$$

Lastly, we have by the definition of conditional probability that, for each event $B_i$, 

$$
\mathbb P(A \cap B_i) = \mathbb P(A \,|\, B_i) \cdot \mathbb P(B_i).
$$

Combining these three steps, we have that

$$
\mathbb P(A) = \mathbb P\left(\bigcup_{i = 1}^n \, (A \cap B_i)\right) = \sum_{i = 1}^n \mathbb P(A \cap B_i) = \sum_{i = 1}^n \mathbb P(A \,|\, B_i) \cdot \mathbb P(B_i),
$$

which is our desired result. Each equality corresponds to one of the preliminary steps above.

</div>
</details>

The following figure gives a visual explanation of the law of total probability.

<img src="figures/w3-law-total-probability.png" alt="summary." style="display:block; width:90%; max-width:600px; height:auto; margin:1rem auto;">

In this figure, we see that the sample space $\Omega$ has been partitioned into six distinct, non-overlapping pieces, $B_1, B_2, \ldots, B_6$. Each one overlaps with $A$ (although this is not necessary for the law of total probability). Assume that the probability is distributed completely uniformly on the rectangle. This can be represented by throwing a dart randomly at the sample space.

Intuitively, instead of computing the area of $A$ and taking the ratio with the entire $\Omega$, we could examine the fraction of each $B_i$ that is occupied by $A$. We then weight this fraction by $\mathbb P(B_i)$, which in this uniform model is the fraction of the rectangle occupied by $B_i$. A larger $B_i$ has a larger probability, so it receives more weight. Summing over all the pieces gives us the whole result because the partition covers all of $\Omega$.

Now, let's look at an example where both of these results are needed.

<div class="callout example">
<div class="label">Example: Using Conditional Probabilities</div>

I just woke up, and I realize that I tragically left my phone at the department last night. I remember that the weather app reported a chance of rain when I checked yesterday, but I don't have my phone to confirm that. I'll take a look out the window momentarily to see how the sky is.

Suppose there are only three categories of precipitation at this time of year: no rain (dry, event $D$), misting (very slight rain, event $M$), or storming (very heavy rain, event $S$). It's also not possible for any two of these types of precipitation to coincide. If it's only misting, I can just walk in the rain for a bit. If there's going to be a storm, I need my umbrella.

I am a big fan of meteorology and know a couple of facts.

First, the probability that it storms on any given day is $\mathbb P(S) = 0.05$. Second, the probability that it's misting on any given day is $\mathbb P(M) = 0.1$.

I also know how likely cloud cover is to appear in the morning *given* the precipitation conditions later in the day. First, if it's dry, the probability of clouds in the morning is $\mathbb P(C \,|\, D) = 0.2$. Second, if it's misting, the probability of clouds in the morning is $\mathbb P(C \,|\, M) = 0.6$. Third, if it's storming, the probability of seeing clouds in the morning is $\mathbb P(C \,|\, S) = 0.9$.

<ol type="1">
  <li>What probability am I interested in calculating before looking out the window, if I want to know whether to bring my umbrella?</li>
  <li>If I look outside my window and determine that it's cloudy, what's the new probability that I'm interested in computing? Then write out the definition of conditional probability for this problem. Let's focus on the numerator first. Do we have this information? If not, can Bayes' rule help?</li>
  <li>Which part of the expression after using Bayes' rule do we still need to compute? What result can we use to compute it? Write out the full expression using that result.</li>
  <li>Which additional probability do we need before we can calculate the actual number?</li>
  <li>Finally, compute the probability.</li>
</ol>

</div>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Let's work it out.

<ol type="1">
  <li>We're interested in calculating the (unconditional) probability that it will storm, $\mathbb P(S)$. Before I look out the window, I don't know what the conditions are like, so I have no information to condition on.</li>
  <li>After I've already determined that it's cloudy, I have information to condition on. What I want to compute now is the probability that it will storm, *given* that it's cloudy. This is $\mathbb P(S \,|\, C)$. If we only use the definition, we get
  
  $$
  \mathbb P(S \,|\, C) = \frac{\mathbb P(C \cap S)}{\mathbb P(C)}.
  $$
  
  We don't have $\mathbb P(C \cap S)$. If we use Bayes' rule instead, we get

  $$
  \mathbb P(S \,|\, C) = \frac{\mathbb P(C \,|\, S) \cdot \mathbb P(S)}{\mathbb P(C)}.
  $$

  For the numerator term, using Bayes' rule allows us to skip using the intersection in the numerator that comes from the definition&mdash;since we don't have that information, we should express the numerator with quantities we do know. However, note that the denominator probability still needs to be computed.</li>
  <li>Since we weren't given $\mathbb P(C)$, we need an additional step. Specifically, using the law of total probability gives us that

  $$
  \mathbb P(C) = \mathbb P(C \,|\, D) \cdot \mathbb P(D) + \mathbb P(C \,|\, M) \cdot \mathbb P(M) + \mathbb P(C \,|\, S) \cdot \mathbb P(S).
  $$

  Why does this hold? It's critical that there are only three non-overlapping possibilities: dry, misting, or storming. We assumed that there can't be any other type of precipitation this time of year, and two of these types of precipitation cannot happen simultaneously. Furthermore, none of the probabilities are zero. Hence, the law of total probability applies, and we can decompose $\mathbb P(C)$ into the conditional probabilities above.

  We combine the numerator and denominator calculations to get the final formula we can use to get the answer:

  $$
  \mathbb P(S \,|\, C) = \frac{\mathbb P(C \,|\, S) \cdot \mathbb P(S)}{\mathbb P(C \,|\, D) \cdot \mathbb P(D) + \mathbb P(C \,|\, M) \cdot \mathbb P(M) + \mathbb P(C \,|\, S) \cdot \mathbb P(S)}.
  $$
  </li>
  <li>We are given all quantities in the formula above except for $\mathbb P(D)$. But great news! We do have the information needed to calculate it. We have that $\mathbb P(D) = 1 - (\mathbb P(M) + \mathbb P(S))$.</li>
  <li>We can now compute the probability. Using the information available and the quantity in part (4), we have that

  $$
  \mathbb P(S \,|\, C) = \frac{(0.9)(0.05)}{(0.2)(0.85) + (0.6)(0.1) + (0.9)(0.05)}.
  $$

  You don't need to calculate it out.
  </li>
</ol>

</div>
</details>

## Combinatorics

Combinatorics is often a very confusing part of elementary probability. There are combinatorics problems that use only the introductory, simple principles but are nevertheless extremely tricky (I get them wrong, my PhD classmates get them wrong, my professors could easily get them wrong).

Let's not discuss the very intricate problems, but there are a few core ideas that are critical for future discussions.

<div class="callout definition">
<div class="label">Definition: Permutation and Combination</div>

Let $n$ be a positive integer, and let $k$ be an integer with $0 \leq k \leq n$.

The number of ***permutations*** $P(n, k)$ for selecting, without replacement, a size-$k$ sequence from $n$ distinct items is

$$
P(n, k) := \frac{n!}{(n - k)!}.
$$

The number of ***combinations*** $C(n, k)$ for selecting, without replacement, a size-$k$ subset from $n$ distinct items is

$$
C(n, k) := \frac{n!}{(n - k)! \,k!}.
$$

</div>

Combinations are perhaps more commonly seen with the notation
$$
C(n, k) = {n \choose k}.
$$

Note that the difference between the permutation and combination formulas is the additional $k!$ factor in the denominator. Let's go into detail on *why* this additional factor appears with an example.

<div class="callout example">
<div class="label">Example: Candy Distribution</div>

Suppose there are five pieces of differently flavored candy and five children.

<ol type="1">

<li>Suppose I distribute the candy to the children, one per child. I can compute the number of ways to do this using permutations: I have 5 choices total, and I need to choose all 5 of them. Using permutations, this is

$$
P(5, 5) = \frac{5!}{(5 - 5)!} = 5 \cdot 4 \cdot 3 \cdot 2 \cdot 1.
$$

More concretely, think about the following: I have 5 choices of candy for the first child, 4 for the second, 3 for the third, 2 for the fourth, and 1 for the last. Using the multiplication rule, I have $5!$ possibilities.</li>

<li>Suppose only the first two children have been good today. The number of ways I can distribute one candy per deserving child can still be computed using permutations. This time, I'm only selecting 2 pieces from the 5. Hence, we have

$$
P(5, 2) = \frac{5!}{(5 - 2)!} = \frac{5!}{3!} = 5 \cdot 4.
$$

More concretely, think about the following: I have 5 choices of candy for the first child and 4 for the second.

Why do we divide by the $(5 - 2)! = 3!$ in the denominator? It's because, when we have $5!$ in the numerator, we've overcounted the orderings of the last 3 pieces of candy when their orders don't matter. For each fixed assignment to the first two children, the remaining 3 pieces can be ordered in $3!$ ways. This is visualized below.

<img src="figures/w3-two-candy.png" alt="Candy orderings grouped by the first two candies given to the two children." style="display:block; width:90%; max-width:600px; height:auto; margin:1rem auto;">

If child one is given green and child two yellow, there are $3!$ ways to arrange the remaining pieces of candy. The same is true if child one is given red and child two blue. We can organize all orderings of the 5 pieces into groups where the first two selections&mdash;the only ones that matter&mdash;are the same. We see that each group has $3! = 6$ orderings. Since we don't care about the last 3 pieces, we should count each group of $3!$ only once. This is why we divide by $3!$.
</li>

<li>I might as well give away all 5 pieces. The second deserving child behaved slightly better than the first, so I'll give the second child 3 pieces and the first child 2. We're going to use combinations here: the order I give the candy to *each* child doesn't matter. Since there are only two children being given candy, splitting the candy into 3 and 2 is the same as choosing 3 to give to the second child. Hence, we can use combinations to obtain

$$
C(5, 3) = \frac{5!}{(5 - 3)! \, 3!} = \frac{5!}{2!\,3!} = \frac{5 \cdot 4}{2 \cdot 1}.
$$

Why do we have both $2!$ and $3!$ in the denominator? The $2!$ comes from the same logic as the permutation case: if I choose 3 pieces of candy for child two, the ordering of the remaining pieces doesn't matter, since they're both going to child one. But the same holds here for the three selected pieces now too: these three are *also* going to the same child, so the ordering within the selected pieces is inconsequential too. We visualize this with the following figure.

<img src="figures/w3-all-candy.png" alt="Twelve orderings for the same split of two candies to one child and three to the other." style="display:block; width:100%; max-width:1000px; height:auto; margin:1rem auto;">

If I've already chosen for child one to receive yellow and pink and child two to receive red, green, and blue, there are $(5-3)! \cdot 3!$ ways to order those pieces. All 12 orderings give the same distribution of candy, so I only want to count them once. This is why we divide by $(5-3)! \cdot 3!$.

</li>

</ol>

</div>

<div class="callout remark">
<div class="label">Remark: Multinomials</div>

If I choose to distribute candy to more than two children, this would be a *multinomial* problem. This has not been covered.

</div>

Using the intuition gained from this example, let's work out the following problem (this was the problem worked through in recitation).

<div class="callout example">
<div class="label">Example: Planting Trees</div>

The lord of a fancy estate has hired you to plant ten different species of trees in ten designated spots on his property.

<ol type="1">
  <li>Suppose the lord gives you permission to plant the trees in whichever spots you want. How many ways are there to plant the ten trees in the ten spots?</li>
  <li>Suppose that three of the ten spots are in the front yard, and the lord asks you to select three particularly magnificent species to display there. How many ways can you choose three of the ten trees and assign them to the three distinct spots?</li>
</ol>

An environmentalist group has hired you to plant numerous identical trees in already-dug holes on a patch of land. These trees are unfortunately very delicate and die easily, and if any trees die over the winter, you want to log the sites that need to be replanted.

When you log the sites, their order does not matter.

Your boss tells you that, if the environmentalist group doesn't tell you *which* trees have died, you need to log every possible set of sites.

<ol type="1">
  <li>Suppose four trees were planted and exactly one tree has died after six months. How many possible sets of sites could be logged?</li>
  <li>If four trees were planted and two have died, how many possible sets of sites could be logged?</li>
  <li>If four trees were planted and three have died, how many possible sets of sites could be logged?</li>
  <li>If four trees were planted and *at least two* have died, how many possible sets of sites could be logged?</li>
</ol>

</div>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Let's discuss the first part of this example. Since the trees are all distinct, the ordering in your arrangement matters.

<ol type="1">
  <li>If I can plant the ten trees in the ten spots in whatever arrangement I want, the number of ways to plant is simply $10!$. I'll look at each spot sequentially: the first spot has 10 choices for the tree, the second has 9, the third has 8, and so forth. The last spot has only 1 tree possibility remaining. This is the *multiplication rule*.</li>
  <li>This is a permutation problem. Since the three spots in his yard are distinct, which tree goes in which spot matters. The first spot has 10 choices, the second has 9, and the third has 8. Therefore, we get $10 \cdot 9 \cdot 8$ assignments of trees to the three spots.
  
  How do we express this as a permutation? Note that
  
  $$
  P(10, 3) = \frac{10!}{(10 - 3)!} = \frac{10!}{7!} = \frac{10 \cdot 9 \cdot 8 \cdot 7 \cdot 6 \cdot 5 \cdot 4 \cdot 3 \cdot 2 \cdot 1}{7 \cdot 6 \cdot 5 \cdot 4 \cdot 3 \cdot 2 \cdot 1} = 10 \cdot 9 \cdot 8.
  $$
  
  Hence, the answer can be expressed in factorial or permutation form.</li>
</ol>

Let's discuss the second part now. The trees are identical and the order in which I log the sites does not matter, so we will use combinations.

<ol type="1">

<li>If exactly one tree has died, it could be the first, second, third, or fourth site. Therefore, there are four possibilities.</li>
<li>If two of the trees have died, I would log two sites: the first site I log could be any of the four, and the second site has three remaining possibilities. Multiplying $4 \cdot 3$ counts each pair twice. For example, logging site 1 and then site 3 gives the same pair as logging site 3 and then site 1. Hence, I need to divide by $2!$. Using combinations, this gives

$$
C(4, 2) = \frac{4!}{(4 - 2)! \, 2!} = \frac{4 \cdot 3 \cdot 2 \cdot 1}{(2 \cdot 1)(2 \cdot 1)} = 6.
$$

</li>

<li>If three trees have died, I would log three sites: the first could be any of the four, the second could be any of the remaining three, and the third could be either of the remaining two. Multiplying $4 \cdot 3 \cdot 2$ counts each set of three sites in $3!$ different orders, but I should count each set only once. Therefore, I need to divide by $3!$. I get

$$
C(4, 3) = \frac{4!}{(4 - 3)! \, 3!} = \frac{4 \cdot 3 \cdot 2 \cdot 1}{(1!) (3 \cdot 2 \cdot 1)} = 4.
$$
</li>

<li>If at least two trees have died, either two died, three died, or four died. The first two cases were computed above. If all four died, I need to log all four, and there's only one way to do that. Hence, the number of possible sets of sites is

$$
6 + 4 + 1 = 11.
$$
</li>
</ol>

</div>
</details>


## Random Variables

What are random variables? Let's start with the definition used in this course.

<div class="callout definition">
<div class="label">Definition: Random Variable</div>

Let $\Omega$ be a sample space. A ***random variable*** $X$ is a function mapping from the set of outcomes $\Omega$ to the real numbers $\mathbb R$.

</div>

This is where a lot of students get confused. A random variable, despite its name, is neither random nor a variable. The randomness comes from the probabilities, which we discussed last week: given a sample space, we can assign probabilities to *events* on that sample space. The random variable only gives you a *numerical mapping* of outcomes in the sample space. 

The most obvious example of this is a coin flip: either we get heads or we get tails. How do we turn the result of a coin flip into a numerical object that we can do math with? By using a random variable, of course! If we define a random variable $X$ such that $X = 1$ when the coin flip is heads and $X = 0$ when the coin flip is tails, $X$ is a random variable that maps the sample space, which in this case is $\Omega = \{\text{heads}, \text{tails}\}$, into something numeric. Note that I could also choose to assign the values differently: I could choose $X = 1$ if the coin is tails, and $X = 0$ when it's heads. Or I could choose $X = 1$ when the coin is heads and $X = -1$ when the coin is tails. All that is required is a numerical encoding of the outcomes in the sample space.

Let's look at a *slightly* more complicated example with a six-sided die. Suppose an outcome records the full configuration of the three visible faces, not only the number on top. The sample space then contains all possible visible configurations. Suppose I roll the die and see the following outcome.

<img src="figures/w3-die-roll-outcome.png" alt="A die showing 5 on top, 3 on the front, and 1 on the right." style="display:block; width:90%; max-width:600px; height:auto; margin:1rem auto;">

The outcome above is a configuration rather than a single number. Define a random variable $X$ to be the number that lands on top. For this outcome, $X = 5$.

Different configurations can produce the same value of $X$. Consider the following two outcomes.

<img src="figures/w3-dice-roll-outcomes.png" alt="Two die configurations with 5 on top but different values on the visible sides." style="display:block; width:90%; max-width:600px; height:auto; margin:1rem auto;">

These are different outcomes because the visible side faces differ, but $X = 5$ for both. A random variable can assign the same number to more than one outcome, so we need to define it precisely.

The most important thing to remember about random variables is this: they are *functions*. We use them because we want numerical representations of the sample space.

### Probability Mass Functions

Random variables called *discrete* random variables have probability mass functions. This means that there is a "discrete" set of values the random variable can take. For example, this set could be $\{0, 1\}$, or $\{0, 1, \ldots, n\}$, or $\{2, 5, 6\}$, or all of $\mathbb N$, or $\{2.1, \pi, 10.9, 10000.1058310\}$. Essentially, if all the values that a random variable $X$ can take can be listed in some type of order, even if the list is infinite, $X$ is discrete.

<div class="callout remark">
<div class="label">Remark: Discrete Random Variables</div>

The set of values a discrete random variable can take is *countable*. This means that its values can be placed in a finite or infinite list. In particular, a discrete random variable can take infinitely many values.

</div>

Every discrete random variable has a probability mass function (pmf).

<div class="callout definition">
<div class="label">Definition: Probability Mass Function</div>

Let $X$ be a discrete random variable, and let $\mathcal X$ be the set of values $X$ can take. The ***probability mass function*** of $X$ is

$$
p(x) := \mathbb P(X = x), \qquad x \in \mathcal X.
$$

It satisfies

$$
p(x) \in [0, 1] \qquad \text{for all } x \in \mathcal X,
$$

and 

$$
\sum_{x \in \mathcal X} p(x) = 1.
$$

This means that the probability that $X$ takes any particular value must be between zero and one, and the probabilities of all possible values must sum to one.

</div>

Let's look at two common distributions for discrete random variables.

One basic example is the *Bernoulli* random variable, $X \sim \text{Bernoulli}(\rho)$. It takes two values: either $X = 0$ or $X = 1$. We have that

$$
p(1) = \rho, \quad p(0) = 1 - \rho.
$$

Here, $\rho \in [0, 1]$.

Another common distribution is the *Binomial* distribution. Let $n$ be a positive integer and let $\rho \in [0, 1]$. A random variable $X \sim \text{Binomial}(n, \rho)$ counts the number of successes in $n$ independent trials, each with success probability $\rho$. Equivalently, $X$ is the sum of $n$ independent $\text{Bernoulli}(\rho)$ random variables. Its pmf is

$$
\mathbb P(X = x) = {n \choose x} \rho^x (1 - \rho)^{n - x}, \qquad x \in \{0, 1, \ldots, n\},
$$

and zero everywhere else.

<div class="callout example">
<div class="label">Example: Binomial Probabilities</div>

Back to the second tree example: you did such a good job last year that the group hires you again, this time to plant 10 trees. The trees all have probability $0.8$ of surviving, and each tree's survival is independent of all the others.

<ol type="1">
  <li>What random variable is appropriate to model the number of tree deaths?</li>
  <li>What is the probability that exactly 2 trees die?</li>
  <li>What is the probability that at least 8 trees die?</li>
  <li>What is the probability that at least 1 tree dies?</li>
</ol>

</div>


<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Let's investigate.

<ol type="1">
  <li>The binomial random variable is the one to use to model the number of deaths. Let $X$ be the number of trees that die. We first need to compute the probability of death: this would be $1 - 0.8 = 0.2$. Hence, we have that

  $$
  X \sim \text{Binomial}(10, 0.2).
  $$
  </li>
  <li>Using the binomial probabilities, we have that
  
  $$
  \mathbb P(X = 2) = {10 \choose 2} (0.2)^2 (0.8)^8.
  $$</li>
  <li>If at least 8 trees die, either 8, 9, or 10 trees die. We can compute the probabilities and add them:
  
  $$
  \mathbb P(X \geq 8) = {10 \choose 8} (0.2)^8(0.8)^2 + {10 \choose 9} (0.2)^9(0.8)^1 + {10 \choose 10} (0.2)^{10}(0.8)^0.
  $$
  </li>
  <li>The probability that at least 1 tree dies is more easily computed using the complement: we can just compute the probability that *all* trees survive, then subtract that probability from 1. Doing this, we obtain
  
  $$
  \mathbb P(X \geq 1) = 1 - \mathbb P(X = 0) = 1 - {10 \choose 0} (0.2)^0 (0.8)^{10}.
  $$</li>
</ol>

</div>
</details>

### Cumulative Distribution Functions

Every random variable has a cumulative distribution function (cdf). You should memorize this definition.

<div class="callout definition">
<div class="label">Definition: Cumulative Distribution Function</div>

Let $X$ be a random variable. The ***cumulative distribution function*** of $X$ is defined as

$$
F(x) := \mathbb P(X \leq x).
$$

</div>

It is critical you remember that the definition is *less than or equal to*. The choice to define the cdf using a non-strict inequality instead of strict is a bit arbitrary. In fact, Soviet mathematicians defined it in the opposite way: with a strict inequality. But since the definition here and now uses a non-strict inequality, it's important to remember it.

The cdf has a few properties you should also know.

<div class="callout proposition">
<div class="label">Proposition: Properties of the Cumulative Distribution Function</div>

Let $X$ be a random variable, and let $F(x)$ be its cdf. Then

<ol type="1">
  <li>The cdf is lower-bounded by zero and upper-bounded by one, meaning
  
  $$
  0 \leq F(x) \leq 1 \qquad \text{for all } x \in \mathbb R.
  $$
  </li>
  <li>The cdf is non-decreasing, meaning that for any $x_1 < x_2$, we have that
  
  $$
  F(x_1) \leq F(x_2).
  $$
  
  This means that the cdf can never decrease as you go further to the right.</li>
  <li>The cdf is right-continuous, meaning
  
  $$
  \lim_{t \downarrow x} F(t) = F(x).
  $$
  
  As we approach the value $x$ from the right, it has to match $F(x)$. This is not necessarily true as we approach from the left.</li>
  <li>Taking the limit as $x \rightarrow -\infty$ and $x \rightarrow +\infty$ gives us probabilities approaching zero and one, respectively:

  $$
  \lim_{x \rightarrow -\infty} F(x) = 0, \qquad \lim_{x \rightarrow +\infty} F(x) = 1.
  $$
  </li>
</ol>


</div>


### Mean and Variance




<!--

<img src="figures/name" alt="Figure-Title" style="display:block; width:90%; max-width:600px; height:auto; margin:1rem auto;"></li>


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
