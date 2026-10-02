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

In essence it means that we break apart the entire space into non-overlapping pieces $B_1, B_2, \ldots, B_n$. Further suppose that $\mathbb P(B_i) > 0$ for each $B_i$.

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

The law of total probability can be visualized by segmenting the sample space for more intuition.

<img src="figures/w3-law-total-probability.png" alt="Figure-Title" style="display:block; width:90%; max-width:600px; height:auto; margin:1rem auto;"></li>

In this figure, we see that the sample space $\Omega$ has been partitioned into six distinct, non-overlapping pieces, $B_1, B_2, \ldots, B_6$. Each one overlaps with $A$ (although this is not necessary for the law of total probability). Assume that the probability is distributed completely uniformly on the rectangle. This can be represented by throwing a dart randomly at the sample space.

Intuitively, instead of computing the area of $A$ and taking the ratio with the entire $\Omega$, we could examine how much space $A$ takes up in each $B_i$ (more specifically, the part of $A$ in common with $B_i$). We then weight this by the area of $B_i$ itself. Obviously, we must account for the way we partitioned $\Omega$; different partitions of the space cannot give us different probabilities. Why do we weight by the probabilities of $B_i$? The larger that $B_i$ is, the more we need to know how $A$ behaves on that chunk, and the more important it is, so we weight it by more. Summing over all the chunks $B_i$ gives us the whole result, since we've accounted for every event in a collection that takes up the entire $\Omega$.

Now, let's look at an example where both of these results are needed.

<div class="callout example">
<div class="label">Example: Using Conditional Probabilities</div>

I just woke up, and I realize that I tragically left my phone at the department last night. I remember that the weather app reported a chance of rain when I checked yesterday, but I don't have my phone to confirm that. I'll take a look out the window momentarily to see how the sky is.

Suppose there are only three categories of precipitation at this time of year: no rain (dry, event $D$), misting (very slight rain, event $M$), or storming (very heavy rain, event $S$). It's also not possible for any two of these types of precipitation to coincide. If it's only misting, I can just walk in the rain for a bit. If there's going to be a storm, I need my umbrella.

I am a big fan of meteorology and know a couple facts.

First, the probability that it storms on any given day is $\mathbb P(S) = 0.05$. Second, the probability that it's misting on any given day is $\mathbb P(M) = 0.1$.

I also know how likely cloud cover is to appear in the morning *given* the precipitation conditions later in the day. First, if it's dry, the probability of clouds in the morning is $\mathbb P(C \,|\, D) = 0.2$. Second, if it's misting, the probability of clouds in the morning is $\mathbb P(C \,|\, M) = 0.6$. Third, if it's storming, the probability of seeing clouds in the morning is $\mathbb P(C \,|\, S) = 0.9$.

<ol type="1">
  <li>What probability am I interested in calculating before looking out the window, if I want to know whether to bring my umbrella?</li>
  <li>If I look outside my window and determine that it's cloudy, what's the new probability that I'm interested in computing? Then write out the definition of conditional probability for this problem. Let's focus on the numerator first. Do we have this information? If not, can Bayes' theorem help?</li>
  <li>Which part of the expression after using Bayes' rule do we still need to compute? What result can we use to compute it? Write out the full expression applying said result.</li>
  <li>Which additional probability do we need to calculate before we can calculate out the actual number?</li>
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
  
  We don't have $\mathbb P(C \cap S)$. If we use Bayes' theorem instead, we get

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
  <li>We can now finally compute out the probability. Using the information available and the quantity in part (4), we have that

  $$
  \mathbb P(S \,|\, C) = \frac{(0.9)(0.05)}{(0.2)(0.85) + (0.6)(0.1) + (0.9)(0.05)}.
  $$

  You don't need to calculate out the exact number.</li>
</ol>

</div>
</details>

### Combinatorics

Combinatorics is often a very confusing part of elementary probability. There are combinatorics problems that use only the introductory, simple principles but are nevertheless extremely tricky (I get them wrong, my PhD classmates get them wrong, my professors could easily get them wrong).

Let's not discuss the very intricate problems, but there are a few core ideas that are critical for future discussions.

<div class="callout definition">
<div class="label">Definition: Permutation and Combination</div>

Let $n, k \in \mathbb N$, where $k \leq n$.

The number of ***permutations*** $P(n, k)$ for selecting, without replaacement, a size-$k$ sequence from $n$ distinct items is

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
<div class="label">Example: Planting Trees</div>

The lord of a fancy estate has hired you to plant ten different species of trees in ten designated spots on his property. 

<ol type="1">
  <li>Suppose the lord gives you permission to plant the trees in whichever spots you want. How many ways are there to plant the ten trees in the ten spots?</li>
  <li>Suppose that three of the ten spots are in the front yard, and the lord asks you to select three particularly magnificent species to display in three special spots in his front yard. How many ways can you choose three special trees from the ten and plant them?</li>
</ol>

An environmentalist group has hired you to plant numerous identical trees in already-dug holes on a patch of land. These trees are unfortunately very delicate and die easily, and if any trees die over the winter, you want to log the sites that need to be replanted. 

When you log the sites, the order doesn't matter: your internal algorithm will automatically identify the optimal replanting order when the next fall comes.

Your boss tells you that, if the environmentalist group doesn't tell you *which* site's tree has died, you need to log all the possibilities.

<ol type="1">
  <li>Suppose the number of trees is four and that after six months, exactly one tree has died. How many possible combinations could be logged?</li>
  <li>If the number of trees planted is still four and two of the trees have died, how many combinations of sites could be logged?</li>
  <li>If the number of trees planted is still four and I only know that three of the trees have died, how many combinations of sites could be logged?</li>
  <li>If the number of trees planted is still four and I only know that *at least two* of the trees have died, how many combinations of sites could be logged?</li>
</ol>

</div>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Let's discuss the first part of this example. Since the trees are all distinct, the ordering in your arrangement matters.

<ol type="1">
  <li>If I can plant the ten trees in the ten spots in whatever arrangement I want, the number of ways to plant is simply $10!$. I'll look at each spot sequentially: the first spot has 10 options of tree, the second has 9, the third has 8, and so forth. The last spot has only 1 tree possibility remaining. This is the *multiplication rule*.</li>
  <li>This is a permutation problem. Since the three spots in his yard are distinct, the order you choose the trees still matters. The first spot has 10 choices, the second has 9, and the third has 8. Therefore, we get $10 \cdot 9 \cdot 8$ for the number of ways to choose three trees for the three spots.
  
  How do we express this as a permutation? Note that
  
  $$
  P(10, 3) = \frac{10!}{(10 - 3)!} = \frac{10!}{7!} = \frac{10 \cdot 9 \cdot 8 \cdot 7 \cdot 6 \cdot 5 \cdot 4 \cdot 3 \cdot 2 \cdot 1}{7 \cdot 6 \cdot 5 \cdot 4 \cdot 3 \cdot 2 \cdot 1} = 10 \cdot 9 \cdot 8.
  $$
  
  Hence, the answer can be expressed in factorial or permutation form.</li>
</ol>

Let's discuss the second part now. My trees are identical and the order I log the sites doesn't matter, so I'll probably be using combinations.

<ol type="1">

<li>If exactly one tree has died, it could be the first, second, third, or fourth site. Therefore, there are four possibilities.</li>
<li>If two of the trees have died, I would log two sites: the first site I log could be any of the four, and the second site I log has three remaining possibilities. But wait! Multiplying $4 \cdot 3$ directly would be double counting. If I log site 1 first and site 3 second, this is the same as logging site 3 first and site 1 second. The number of ways I double counted is 2. Hence, I need to divide by $2!$. Using combinations, this would be

$$
C(4, 2) = \frac{4!}{(4 - 2)! \, 2!} = \frac{4 \cdot 3 \cdot 2 \cdot 1}{(2 \cdot 1)(2 \cdot 1)} = 6.
$$

</li>

<li>If three trees have died, I would log three sites: the first I log could be any of the four, the second could be any of the remaining three, and the third could be either of the remaining two. However, multiplying $4 \cdot 3 \cdot 2$ is still over-counting: I need to account for how many times I over-counted. Each set of three sites has $3!$ ways of ordering, and I should only count one of them as a distinct logging. Therefore, I need to divide by $3!$. I get

$$
C(4, 3) = \frac{4!}{(4 - 3)! \, 3!} = \frac{4 \cdot 3 \cdot 2 \cdot 1}{(1!) (3 \cdot 2 \cdot 1)} = 4.
$$
</li>

<li>If at least two trees have died, either two died, three died, or four died. The first two cases were computed above. If all four died, I need to log all four, and there's only one way to do that. Hence, the number of possible loggings is

$$
6 + 4 + 1 = 11.
$$
</ol>

</div>
</details>


## Random Variables

What are random variables? As always, let's start with the rigorous definition.

<div class="callout definition">
<div class="label">Definition: Random Variable</div>

Let $\Omega$ be a sample space. A ***random variable*** $X$ is a function mapping from the set of outcomes $\Omega$ to the real numbers $\mathbb R$.

</div>

This is where a lot of students get confused. A random variable, despite its name, is neither random nor a variable. The randomness comes from the probabilities, which we discussed last week: given a sample space, we can assign probabilities to *events* on that sample space. The random variable only gives you a *numerical mapping* of outcomes in the sample space. 

The most obvious example of this is a coin flip: either we get heads or we get tails. How do we turn the result of a coin flip into a numerical object that we can do math with? By using a random variable, of course! If we define a random variable $X$ such that $X = 1$ when the coin flip is heads and $X = 0$ when the coin flip is tails, $X$ is a random variable that maps the sample space, which in this case is $\Omega = \{\text{heads}, \text{tails}\}$, into something numeric. Note that I could also choose to assign the values differently: I could choose $X = 1$ if the coin is tails, and $X = 0$ when it's heads. Or I could choose $X = 1$ when the coin is heads and $X = -1$ when the coin is tails. All that is required is a numerical encoding of the outcomes in the sample space.

Let's look at a *slightly* more complicated example: suppose I have a six-sided die. Outcomes from rolling said die can also very easily (and even more intuitively) be represented with numbers. Suppose I roll one die.

<img src="figures/w3-die-roll-outcome.png" alt="Figure-Title" style="display:block; width:90%; max-width:600px; height:auto; margin:1rem auto;"></li>

If the above is what I see, is it already a numerical value? Not yet. I would still have to create a random variable $X$ where $X$ takes the value of whichever number lands on top. For the outcome above, it's $X = 5$. Compared to the coin flip example, it's just a little more obvious which numbers I should assign which outcomes.

If it's still not clear, we can look at a more detailed example. Suppose I define my sample space to be "all configurations of the three sides that I can see."

<img src="figures/w3-dice-roll-outcomes.png" alt="Figure-Title" style="display:block; width:90%; max-width:600px; height:auto; margin:1rem auto;"></li>

The two outcomes visualized here are two different configurations (outcomes) within the sample space. If I still define my random variable $X$ to be "the number that lands on top," we have that $X = 5$ for *both* of the outcomes above. This is why we need to be very specific about how we define our random variables.

The most important thing to remember about random variables is this: they are *functions*. We use them because we want numerical representations of the sample space.

### Probability Mass Functions

Random variables called *discrete* random variables have probability mass functions. This means that there is a "discrete" set of values the random variable can take. For example, this set could be $\{0, 1\}$, or $\{0, 1, \ldots, n\}$, or $\{2, 5, 6\}$, or all of $\mathbb N$, or $\{2.1, \pi, 10.9, 10000.1058310\}$. Essentially, if all the values that a random variable $X$ can take can be listed in some type of order, even if the list is infinite, $X$ is discrete.

<div class="callout remark">
<div class="label">Remark: Discrete Random Variables</div>

The rigorous requirement for a discrete random variable $X$ is that the set of values $X$ can take is *countable*. But if you don't know what this means, just ignore that: an intuition is enough. The important thing to remember is that discrete random variables *can* take infinitely many values.

</div>

Every discrete random variable has a probability mass function (pmf).

<div class="callout definition">
<div class="label">Definition: Probability Mass Function</div>

Let $X$ be a discrete random variable, and let $\mathcal X$ be the set of values $X$ can take. A ***probability mass function*** $p(x)$ is a function where

$$
p(x) \in [0, 1] \qquad \text{for all } x \in \mathcal X,
$$

and 

$$
\sum_{x \in \mathcal X} p(x) = 1.
$$

This means that the pmf $p(x) = \mathbb P(X = x)$ at any $x$&mdash;the probability that $X$ takes the value $x$&mdash;must be between zero and one (which of course is the case for all probabilities), and that the sum of all the probabilities must be equal to one.

</div>

Let's look at a few examples of "commonly" seen distributions (pmfs) on random variables.

The *Bernoulli* random variable, $X \sim \text{Bernoulli}(\rho)$, is the simplest "recognizable" (common) one. It takes two values: either $X = 0$ or $X = 1$. We have that $p(1) = \rho, p(0) = 1 - \rho$. Note that we need $\rho \in [0, 1]$. 

The next most common is the *Binomial* distribution. This can be represented as the sum of many independent Bernoullis with the same probability. Let's now look at an example of a Binomial random variable.

<div class="callout example">
<div class="label">Example: Binomial Probabilities</div>

Back to the second tree example: you did such a good job last year that they hire you again, this time to plant 10 trees. The trees all have equal probability $0.8$ of surviving, with each tree's survival independent of all others.

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
  <li>Using the binomial probabilities, we have that
  
  $$
  \mathbb P(X = 2) = {10 \choose 2} (0.2)^2 (0.8)^8.
  $$</li>
  <li>If at least 8 trees die, either 8, 9, or 10 trees died. We can simply compute the probabilities and add them:
  
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

There exists an interesting relationship between the Binomial and Bernoulli random variables.

### Cumulative Distribution Functions

Every random variable has a cumulative distribution function (cdf). You should memorize this definition.

<div class="callout definition">
<div class="label">Definition: Cumulative Distribution Function</div>

Let $X$ be a random variable. The ***cumulative distribution function*** of $X$ is defined as

$$
F(x) := \mathbb P(X \leq x).
$$

</div>

It is critical you remember that the definition is *less than or equal to*. The choice to make it a non-strict inequality instead of strict is not really meaningful. In fact, Soviet mathematicians defined it in the opposite way: with a strict inequality. But since the convention here and now is the non-strict inequality, it's important to remember it.

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
  \lim_{x^+ \downarrow \, x} F(x^+) = F(x).
  $$
  
  As we approach the value $x$ from the right, it has to match $F(x)$. This is not necessarily true as we approach from the left.</li>
  <li>Taking the limit as $x \rightarrow -\infty$ and $x \rightarrow +\infty$ gives us probabilities approaching zero and one, respectively:

  $$
  \lim_{x \rightarrow -\infty} F(x) = 0, \qquad \lim_{x \rightarrow +\infty} F(x) = 1.
  $$
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
