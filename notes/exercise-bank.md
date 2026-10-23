<div class="solution-visibility" data-show-solutions="true"></div>

## Section 1: Sets

<details class="collapsible">
<summary>Exercises</summary>
<div class="collapsible__content">

**Exercise 1.1**

For each of the following sets, determine whether it must be empty. Justify your answer.

<ol type="1">
    <li>$A \cap B$, where $A$ and $B$ are disjoint.</li>
    <li>$(A \cup B) \cap B^c$.</li>
    <li>$B \cap (A \cap B^c)$.</li>
    <li>$(A \cap B^c) \cup (A^c \cap B)$.</li>
</ol>




<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Sets $(1)$ and $(3)$ must be empty; sets $(2)$ and $(4)$ need not be empty.

<ol type="1">
  <li>By definition, if $A$ and $B$ are disjoint, then $A \cap B = \emptyset$.</li>
  <li>The set $A \cup B$ includes all elements in either $A$ or $B$ or both. Intersecting with the complement of $B$ only takes the elements in $B$ away. If there are elements in $A$ that are not also in $B$, these remain after intersecting with $B^c$ because these elements lie in both $A$ and $B^c$. Therefore, $(A \cup B) \cap B^c$ is not necessarily empty.

  One can also directly use the distributive property to obtain $(A\cup B) \cap B^c = (A \cap B^c) \cup (B \cap B^c) = A \cap B^c$, since $B \cap B^c = \emptyset$.</li>
  <li>Everything in $A \cap B^c$ is an element of both $A$ and $B^c$. Intersecting further with $B$ takes away all elements, since nothing can simultaneously be in $B$ and $B^c$.</li>
  <li>This set includes all elements that are *only* in $A$ or *only* in $B$. It is empty exactly when $A=B$, so it is not necessarily empty.</li>
</ol>

</div>
</details>


**Exercise 1.2**

Simplify each expression, then determine which expressions are equal to $A \setminus B$.

<ol type="1">
  <li>$A \cap B^c$.</li>
  <li>$(A \cup B) \cap B^c$.</li>
  <li>$A \cap (A \cap B)^c$.</li>
  <li>$A^c \cap B$.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Expressions $(1)$, $(2)$, and $(3)$ simplify to $A \setminus B$; expression $(4)$ does not.

<ol type="1">
  <li>This is the definition of $A \setminus B$.</li>
  <li>We have $(A \cup B) \cap B^c = (A \cap B^c) \cup (B \cap B^c) = A \cap B^c$.</li>
  <li>By De Morgan's law, $A \cap (A \cap B)^c = A \cap (A^c \cup B^c) = A \cap B^c$.</li>
  <li>This is $B \setminus A$, not $A \setminus B$.</li>
</ol>

</div>
</details>


**Exercise 1.3**

Write, in set notation, the event consisting of outcomes that are in $A$ or $C$, but not in $B$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The event is $(A\cup C)\cap B^c$. The union $A\cup C$ contains everything in $A$ or $C$. Intersecting this union with $B^c$ removes the outcomes in $B$.

</div>
</details>


**Exercise 1.4**

Suppose $A \subseteq B$. For each statement below, determine whether it must be true. Justify your answer.

<ol type="1">
  <li>$A \cap B = A$.</li>
  <li>$A \cup B = B$.</li>
  <li>$B^c \subseteq A^c$.</li>
  <li>$A^c \subseteq B^c$.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Statements $(1)$, $(2)$, and $(3)$ must be true. Statement $(4)$ need not be true. Every element of $A$ is already in $B$, so intersecting with $B$ leaves $A$, and adding $A$ to $B$ leaves $B$. Also, anything outside $B$ must be outside $A$, so $B^c \subseteq A^c$. The reverse inclusion does not have to hold.

</div>
</details>


**Exercise 1.5**

Simplify each expression and describe it in words. Which expressions represent the event that neither $A$ nor $B$ occurs?

<ol type="1">
  <li>$(A \cup B)^c$.</li>
  <li>$A^c \cap B^c$.</li>
  <li>$(A \cap B)^c$.</li>
  <li>$A^c \cup B^c$.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Expressions $(1)$ and $(2)$ represent this event. Saying that neither event occurs means that the outcome is outside both $A$ and $B$. By De Morgan's law, $(A \cup B)^c = A^c \cap B^c$. Expressions $(3)$ and $(4)$ are equal to each other and mean that the outcome is outside at least one of the events.

</div>
</details>

**Exercise 1.6**

A coin is flipped five times. Let $A_j$ be the event that flip $j$ is heads. Describe each event in words.

<ol type="a">
  <li>$\displaystyle \bigcup_{j=1}^{5}A_j$.</li>
  <li>$\displaystyle \bigcap_{j=1}^{5}A_j$.</li>
  <li>$\displaystyle \bigcup_{j=1}^{4}(A_j\cap A_{j+1})$.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="a">
  <li>At least one of the five flips is heads.</li>
  <li>All five flips are heads.</li>
  <li>There is at least one pair of consecutive heads.</li>
</ol>

</div>
</details>


**Exercise 1.7**

Suppose $A\subseteq B$, and define $C=B\cap A^c$. Find $A\cap C$ and $A\cup C$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The set $C$ is the part of $B$ that lies outside $A$. Therefore,

$$
A\cap C=\emptyset
\qquad\text{and}\qquad
A\cup C=B.
$$

</div>
</details>


**Exercise 1.8**

A sample space has $12$ outcomes. Suppose $|A|=7$ and $|B|=6$. Find the smallest and largest possible values of $|A\cup B|$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The smallest possible value is $7$. This occurs when $B\subseteq A$.

The largest possible value is $12$. Since $|A|+|B|=13$, at least one outcome must be in both sets, and the two sets can together cover all $12$ outcomes.

</div>
</details>

**Exercise 1.9**

Suppose

$$
A\cap B=A\cup B.
$$

What must be true about $A$ and $B$?

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

We must have $A=B$. If $x\in A$, then $x\in A\cup B=A\cap B$, so $x\in B$. Thus, $A\subseteq B$. The same argument with the roles reversed gives $B\subseteq A$.

</div>
</details>


**Exercise 1.10**

Simplify

$$
(A\cup B)\cap(A\cup B^c).
$$

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Using the distributive property,

$$
(A\cup B)\cap(A\cup B^c)
=A\cup(B\cap B^c)
=A\cup\emptyset
=A.
$$

</div>
</details>


**Exercise 1.11**

Suppose $A\cap B=\emptyset$ and $A\cup B=S$, where $S$ is the sample space. Express $B$ using $A$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The two sets do not overlap and together contain every outcome in $S$. Therefore,

$$
B=A^c.
$$

</div>
</details>


**Exercise 1.12**

Suppose $A\subseteq B\subseteq C$. Write $C$ as a union of three pairwise disjoint sets involving $A$ and set differences.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

We can write

$$
C=A\cup(B\setminus A)\cup(C\setminus B).
$$

The three sets are pairwise disjoint: the second set lies outside $A$, the third lies outside $B$, and both $A$ and $B\setminus A$ lie inside $B$.

</div>
</details>

</div>
</details>











## Section 2: Probability

<details class="collapsible">
<summary>Exercises</summary>
<div class="collapsible__content">

**Exercise 2.1**

Suppose $\mathbb P(A) = 0.35$. Find $\mathbb P(A^c)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

An event and its complement have probabilities that sum to one, so

$$
\mathbb P(A^c) = 1 - \mathbb P(A) = 1 - 0.35 = 0.65.
$$

</div>
</details>


**Exercise 2.2**

Suppose $A$ and $B$ are disjoint, $\mathbb P(A) = 0.20$, and $\mathbb P(B) = 0.45$. Find $\mathbb P(A \cup B)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Since the events are disjoint, $\mathbb P(A \cap B) = 0$. Therefore,

$$
\mathbb P(A \cup B) = \mathbb P(A) + \mathbb P(B) = 0.20 + 0.45 = 0.65.
$$

</div>
</details>


**Exercise 2.3**

A fair six-sided die is rolled. List the outcomes for which the result is even or greater than $4$, and then find the probability of this event.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The favorable outcomes are $\{2, 4, 5, 6\}$, so the probability is $4/6 = 2/3$. Notice that $6$ is counted only once even though it satisfies both conditions.

</div>
</details>


**Exercise 2.4**

Suppose $\mathbb P(A) = 0.55$ and $\mathbb P(B) = 0.30$. Find the full range of possible values of $\mathbb P(A \cap B)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

An intersection cannot have greater probability than either of the events being intersected. In particular,

$$
\mathbb P(A \cap B) \leq \mathbb P(B) = 0.30.
$$

The smallest possible value is $0$ because $0.55+0.30\leq1$. Therefore,

$$
0\leq\mathbb P(A\cap B)\leq0.30.
$$

</div>
</details>


**Exercise 2.5**

A coin lands on heads with probability $0.8$ and is flipped twice independently. List the sequences containing exactly one head, and find their total probability.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Exactly one head can occur as $HT$ or $TH$. Each sequence has probability $(0.8)(0.2)$, so the total probability is

$$
2(0.8)(0.2)=0.32.
$$

</div>
</details>

**Exercise 2.6**

Suppose $\mathbb P(A)=0.45$, $\mathbb P(B)=0.40$, and $\mathbb P(A\cup B)=0.70$. Find $\mathbb P(A\cap B)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

By the addition rule,

$$
\mathbb P(A\cap B)
=\mathbb P(A)+\mathbb P(B)-\mathbb P(A\cup B)
=0.45+0.40-0.70
=0.15.
$$

</div>
</details>


**Exercise 2.7**

An alphabet has $m$ letters, and every string of a given length is equally likely.

<ol type="a">
  <li>Find the probability that a random two-letter string reads the same forward and backward.</li>
  <li>Find the probability that a random three-letter string reads the same forward and backward.</li>
  <li>Compare the two probabilities.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="a">
  <li>The second letter must match the first, so the probability is $1/m$.</li>
  <li>The third letter must match the first, while the middle letter can be anything. The probability is again $1/m$.</li>
  <li>The probabilities are equal.</li>
</ol>

</div>
</details>


**Exercise 2.8**

Two fair six-sided dice are rolled. Without listing all $36$ outcomes, compare $\mathbb P(\text{sum}=4)$ and $\mathbb P(\text{sum}=10)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The probabilities are equal. Replacing each die result $d$ by $7-d$ gives a one-to-one match between outcomes with sum $4$ and outcomes with sum $10$.

For example, $(1,3)$ matches $(6,4)$, $(2,2)$ matches $(5,5)$, and $(3,1)$ matches $(4,6)$.

</div>
</details>

**Exercise 2.9**

Suppose $\mathbb P(A)=0.65$ and $\mathbb P(B)=0.55$. Find the full range of possible values of $\mathbb P(A\cup B)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The union contains each event, so its probability is at least the larger individual probability:

$$
\mathbb P(A\cup B)\geq0.65.
$$

Also,

$$
\mathbb P(A\cup B)\leq
\min\{1,\mathbb P(A)+\mathbb P(B)\}=1.
$$

Both endpoints can occur. Therefore,

$$
0.65\leq\mathbb P(A\cup B)\leq1.
$$

</div>
</details>


**Exercise 2.10**

Four events each have probability at most $0.08$.

<ol type="a">
  <li>Find the smallest guaranteed upper bound for the probability that at least one of the events occurs.</li>
  <li>Find the largest guaranteed lower bound for the probability that none of the events occurs.</li>
  <li>Does this reasoning require the events to be independent?</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The probability of a union is at most the sum of the individual probabilities. Therefore,

$$
\mathbb P(\text{at least one occurs})
\leq4(0.08)=0.32.
$$

Taking the complement gives

$$
\mathbb P(\text{none occurs})\geq1-0.32=0.68.
$$

Independence is not required. These bounds are attained when the four events are pairwise disjoint and each has probability $0.08$, so they cannot be improved.

</div>
</details>


**Exercise 2.11**

Events $A$, $B$, and $C$ are pairwise disjoint, and

$$
\mathbb P(A\cup B)=0.52,\qquad
\mathbb P(B\cup C)=0.67,\qquad
\mathbb P(A\cup C)=0.45.
$$

Find $\mathbb P(A)$, $\mathbb P(B)$, $\mathbb P(C)$, and $\mathbb P(A\cup B\cup C)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Because the events are pairwise disjoint, let

$$
a=\mathbb P(A),\qquad b=\mathbb P(B),\qquad c=\mathbb P(C).
$$

Then

$$
a+b=0.52,\qquad b+c=0.67,\qquad a+c=0.45.
$$

Adding the equations gives $2(a+b+c)=1.64$, so

$$
\mathbb P(A\cup B\cup C)=a+b+c=0.82.
$$

It follows that

$$
\mathbb P(A)=0.15,\qquad
\mathbb P(B)=0.37,\qquad
\mathbb P(C)=0.30.
$$

</div>
</details>


**Exercise 2.12**

Suppose $A\subseteq B$, $\mathbb P(A)=0.28$, and $\mathbb P(B)=0.61$. Find $\mathbb P(B\setminus A)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The sets $A$ and $B\setminus A$ are disjoint and have union $B$. By additivity,

$$
\mathbb P(B)
=\mathbb P(A)+\mathbb P(B\setminus A).
$$

Therefore,

$$
\mathbb P(B\setminus A)=0.61-0.28=0.33.
$$

</div>
</details>

</div>
</details>



## Section 3: Conditional Probability

<details class="collapsible">
<summary>Exercises</summary>
<div class="collapsible__content">

**Exercise 3.1**

Suppose $\mathbb P(A \cap B) = 0.18$ and $\mathbb P(B) = 0.60$. Find $\mathbb P(A \,|\, B)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

By the definition of conditional probability,

$$
\mathbb P(A \,|\, B) = \frac{\mathbb P(A \cap B)}{\mathbb P(B)} = \frac{0.18}{0.60} = 0.30.
$$

</div>
</details>


**Exercise 3.2**

Suppose $\mathbb P(A) > \mathbb P(B) > 0$ and $\mathbb P(A \cap B) > 0$. Determine which is larger: $\mathbb P(A \,|\, B)$ or $\mathbb P(B \,|\, A)$. Justify your answer.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The two conditional probabilities have the same positive numerator:

$$
\mathbb P(A \,|\, B) = \frac{\mathbb P(A \cap B)}{\mathbb P(B)},
\qquad
\mathbb P(B \,|\, A) = \frac{\mathbb P(A \cap B)}{\mathbb P(A)}.
$$

Since $\mathbb P(B)$ is the smaller denominator, $\mathbb P(A \,|\, B)$ is larger.

</div>
</details>


**Exercise 3.3**

Suppose $\mathbb P(A) = 0.4$, $\mathbb P(B) = 0.5$, and $\mathbb P(A \cap B) = 0.2$.

<ol type="a">
  <li>Are $A$ and $B$ independent?</li>
  <li>Are $A$ and $B$ disjoint?</li>
</ol>

Justify both answers.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The events are independent because

$$
\mathbb P(A)\mathbb P(B) = (0.4)(0.5) = 0.2 = \mathbb P(A \cap B).
$$

The events are not disjoint because their intersection has positive probability.

</div>
</details>


**Exercise 3.4**

Can two disjoint events that each have positive probability be independent? Explain.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

No. Disjointness gives $\mathbb P(A \cap B) = 0$, while the positive probabilities give $\mathbb P(A)\mathbb P(B) > 0$. Therefore,

$$
\mathbb P(A \cap B) \neq \mathbb P(A)\mathbb P(B),
$$

so the events are not independent.

</div>
</details>


**Exercise 3.5**

One of two bags is selected with equal probability. Bag A contains one red ball and one blue ball. Bag B contains two red balls. One ball is drawn at random from the selected bag. Find the probability that the ball is red.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Using the two possible bags,

$$
\mathbb P(\text{red})
= \mathbb P(\text{red} \,|\, \text{Bag A})\mathbb P(\text{Bag A})
+ \mathbb P(\text{red} \,|\, \text{Bag B})\mathbb P(\text{Bag B})
= \frac{1}{2}\cdot\frac{1}{2} + 1\cdot\frac{1}{2}
= \frac{3}{4}.
$$

</div>
</details>

**Exercise 3.6**

In a class of $40$ students, $24$ take calculus, $18$ take programming, and $10$ take both.

<ol type="a">
  <li>Find the probability that a randomly selected programming student takes calculus.</li>
  <li>Find the probability that a randomly selected calculus student takes programming.</li>
  <li>Are these two conditional probabilities equal?</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Let $C$ be the event that the student takes calculus and $P$ the event that the student takes programming.

<ol type="a">
  <li>$\displaystyle \mathbb P(C\mid P)=\frac{10}{18}=\frac59$.</li>
  <li>$\displaystyle \mathbb P(P\mid C)=\frac{10}{24}=\frac5{12}$.</li>
  <li>No. The same overlap is divided by two different group sizes.</li>
</ol>

</div>
</details>


**Exercise 3.7**

Use the two bags from Exercise 3.5. Given that the selected ball is red, find the probability that Bag B was selected.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

We found in Exercise 3.5 that $\mathbb P(\text{red})=3/4$. Also,

$$
\mathbb P(\text{Bag B}\cap\text{red})
=\mathbb P(\text{Bag B})\mathbb P(\text{red}\mid\text{Bag B})
=\frac12.
$$

Therefore,

$$
\mathbb P(\text{Bag B}\mid\text{red})
=\frac{1/2}{3/4}
=\frac23.
$$

</div>
</details>


**Exercise 3.8**

Suppose $A$ and $B$ are independent. Must $A$ and $B^c$ also be independent? Prove your answer using probabilities.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Yes. Since $A=(A\cap B)\cup(A\cap B^c)$ and the two pieces are disjoint,

$$
\begin{split}
\mathbb P(A\cap B^c)
&=\mathbb P(A)-\mathbb P(A\cap B)\\
&=\mathbb P(A)-\mathbb P(A)\mathbb P(B)\\
&=\mathbb P(A)\bigl(1-\mathbb P(B)\bigr)\\
&=\mathbb P(A)\mathbb P(B^c).
\end{split}
$$

Thus, $A$ and $B^c$ are independent.

</div>
</details>

**Exercise 3.9**

Suppose $\mathbb P(C)>0$,

$$
\mathbb P(A\mid C)=0.35
\qquad\text{and}\qquad
\mathbb P(B\mid C)=0.50.
$$

Find the full range of possible values of $\mathbb P(A\cup B\mid C)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Within the condition $C$, the union must have probability at least the larger individual probability and at most the sum of the two probabilities. Therefore,

$$
0.50\leq\mathbb P(A\cup B\mid C)\leq0.35+0.50=0.85.
$$

Both endpoints can occur.

</div>
</details>


**Exercise 3.10**

Suppose $\mathbb P(A\mid B)=1$ and $\mathbb P(B)=0.40$. Find the smallest and largest possible values of $\mathbb P(A)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The condition $\mathbb P(A\mid B)=1$ gives

$$
\mathbb P(A\cap B)=\mathbb P(B)=0.40.
$$

Since $A\cap B\subseteq A$, we must have $\mathbb P(A)\geq0.40$. The largest possible probability of any event is $1$. Both endpoints can occur, so

$$
0.40\leq\mathbb P(A)\leq1.
$$

</div>
</details>


**Exercise 3.11**

Suppose $\mathbb P(B)>0$, $\mathbb P(B^c)>0$,

$$
\mathbb P(A\mid B)=0.75,
\qquad
\mathbb P(A\mid B^c)=0.25.
$$

Without knowing $\mathbb P(B)$, give the sharpest possible bounds on $\mathbb P(A)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

By conditioning on whether $B$ occurs,

$$
\begin{split}
\mathbb P(A)
&=0.75\mathbb P(B)+0.25\mathbb P(B^c)\\
&=0.25+0.50\mathbb P(B).
\end{split}
$$

Because $0<\mathbb P(B)<1$,

$$
0.25<\mathbb P(A)<0.75.
$$

The value can be arbitrarily close to either endpoint, so these bounds cannot be improved.

</div>
</details>


**Exercise 3.12**

Suppose $A$ and $B$ are independent, $\mathbb P(A)=0.30$, and $\mathbb P(B)=0.40$. Find $\mathbb P(A\cup B)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Independence gives

$$
\mathbb P(A\cap B)=\mathbb P(A)\mathbb P(B)=(0.30)(0.40)=0.12.
$$

Therefore,

$$
\mathbb P(A\cup B)=0.30+0.40-0.12=0.58.
$$

</div>
</details>

</div>
</details>



## Section 4: Random Variables

<details class="collapsible">
<summary>Exercises</summary>
<div class="collapsible__content">

**Exercise 4.1**

Classify each random variable below as discrete or continuous.

<ol type="1">
  <li>The number of emails received in one hour.</li>
  <li>The time required to walk to class.</li>
  <li>The temperature at noon.</li>
  <li>The number of broken light bulbs in a building.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Variables $(1)$ and $(4)$ are discrete. Counts take values in a countable set. Variables $(2)$ and $(3)$ are continuous because time and temperature are modeled as measurements that can vary throughout an interval.

</div>
</details>


**Exercise 4.2**

Two coins are flipped, and $X$ is the number of heads.

<ol type="a">
  <li>List all possible values of $X$.</li>
  <li>Write the sample space of the two flips.</li>
  <li>Explain why these two sets are different.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The possible values of $X$ are $\{0,1,2\}$. The sample space is $\{HH,HT,TH,TT\}$. The sample space records the flip outcomes, while the first set records the numerical values assigned to those outcomes by $X$.

</div>
</details>


**Exercise 4.3**

A fair six-sided die is rolled. Let $X=1$ if the result is even and $X=0$ otherwise. Find $\mathbb P(X=1)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The event $X=1$ occurs when the die result is $2$, $4$, or $6$, so its probability is $3/6=1/2$.

</div>
</details>


**Exercise 4.4**

Suppose $X$ is a continuous random variable with a pdf. For each statement below, determine whether it must be true.

<ol type="1">
  <li>$\mathbb P(X=2)=0$.</li>
  <li>The pdf of $X$ is at most $1$ everywhere.</li>
  <li>$X$ can take only positive values.</li>
  <li>The CDF of $X$ is constant.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Statement $(1)$ must be true. Statements $(2)$ and $(3)$ need not be true, while statement $(4)$ cannot be true for a valid CDF. A continuous random variable has probability zero of taking any one fixed value. A pdf may be greater than $1$ at some values, and a continuous random variable may take negative values. A CDF must approach $0$ as $x\to-\infty$ and $1$ as $x\to\infty$, so it cannot be constant on all of $\mathbb R$.

</div>
</details>


**Exercise 4.5**

Suppose $X$ can take the values $-1$, $0$, and $3$, and let $Y=2X+1$. List all possible values of $Y$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Applying the transformation $2x+1$ to each possible value of $X$ gives

$$
2(-1)+1=-1, \qquad 2(0)+1=1, \qquad 2(3)+1=7.
$$

Thus, the possible values of $Y$ are $\{-1,1,7\}$.

</div>
</details>

**Exercise 4.6**

Two fair four-sided dice are rolled, with faces numbered $1$ through $4$. Let $X$ be the larger result.

<ol type="a">
  <li>List the possible values of $X$.</li>
  <li>Which value is most likely?</li>
  <li>Which value is least likely?</li>
</ol>

Explain parts (b) and (c) without listing all $16$ ordered outcomes.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The possible values are $\{1,2,3,4\}$. The most likely value is $4$, and the least likely value is $1$.

For $X=k$, both dice must be at most $k$, but they cannot both be at most $k-1$. Therefore, the number of ordered outcomes is

$$
k^2-(k-1)^2=2k-1.
$$

These counts increase as $k$ increases.

</div>
</details>


**Exercise 4.7**

Six light bulbs are tested. Let $X$ be the number that fail.

<ol type="a">
  <li>Suppose the bulbs fail independently, and each fails with probability $0.1$. Does $X$ have a binomial distribution? If so, give its parameters.</li>
  <li>Suppose instead that a power surge makes all six bulbs fail with probability $0.1$ and makes none of them fail otherwise. Does $X$ have a binomial distribution? Explain.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="a">
  <li>Yes. There are six independent trials, each with two possible outcomes, and the failure probability is the same for each bulb. Thus, $X\sim\operatorname{Bin}(6,0.1)$.</li>
  <li>No. The bulb outcomes are tied together rather than independent, and $X$ can take only the values $0$ and $6$.</li>
</ol>

</div>
</details>


**Exercise 4.8**

Consider three models for a count $X$.

- Model I: $X$ is the number of successes in three independent trials, each with success probability $1/3$.
- Model II: $X=1$ with probability $1$.
- Model III: $X=3$ with probability $1/3$ and $X=0$ otherwise.

<ol type="a">
  <li>Give the possible values of $X$ under each model.</li>
  <li>Find $\mathbb E[X]$ under each model.</li>
  <li>Do the three models give the same distribution?</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="a">
  <li>The possible values are $\{0,1,2,3\}$ under Model I, $\{1\}$ under Model II, and $\{0,3\}$ under Model III.</li>
  <li>Each model has expected value $1$. For Model I, $\mathbb E[X]=3(1/3)=1$. For Model II, the value is always $1$. For Model III, $\mathbb E[X]=(3)(1/3)+(0)(2/3)=1$.</li>
  <li>No. Their possible values and their probabilities are different. Equal expected values do not imply equal distributions.</li>
</ol>

</div>
</details>

**Exercise 4.9**

For an event $A$, define $I_A=1$ when $A$ occurs and $I_A=0$ otherwise. Define $I_B$ in the same way.

<ol type="a">
  <li>If $I_A+I_B\leq1$ for every outcome, what must be true about $A$ and $B$?</li>
  <li>If $I_A+I_B=1$ for every outcome, what must be true about $A$ and $B$?</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="a">
  <li>The two indicators can never both equal $1$, so $A\cap B=\emptyset$.</li>
  <li>Exactly one indicator equals $1$ for every outcome. Thus, exactly one of $A$ and $B$ occurs, so $B=A^c$.</li>
</ol>

</div>
</details>


**Exercise 4.10**

Two independent fair six-sided dice are rolled, and $X$ is the larger result.

<ol type="a">
  <li>Find $\mathbb P(X\leq4)$ without finding the full pmf of $X$.</li>
  <li>Find $\mathbb P(X>4)$.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The event $X\leq4$ occurs exactly when both dice are at most $4$. By independence,

$$
\mathbb P(X\leq4)=\left(\frac46\right)^2=\frac49.
$$

Therefore,

$$
\mathbb P(X>4)=1-\frac49=\frac59.
$$

</div>
</details>


**Exercise 4.11**

Let $X$ be the number of events among $A$, $B$, and $C$ that occur.

<ol type="a">
  <li>Write $X$ as a sum of indicator random variables.</li>
  <li>Suppose $A$, $B$, and $C$ are pairwise disjoint and $A\cup B\cup C=S$. What value does $X$ take?</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="a">
  <li>
  $$
  X=I_A+I_B+I_C.
  $$</li>
  <li>The three events form a partition of the sample space, so exactly one occurs for every outcome. Therefore, $X=1$ for every outcome.</li>
</ol>

</div>
</details>


**Exercise 4.12**

Suppose $X$ can take the values $-2$, $0$, and $2$, and let $Y=X^2$.

<ol type="a">
  <li>List the possible values of $Y$.</li>
  <li>If $Y$ is known, can $X$ always be determined? State exactly when it can and cannot.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="a">
  <li>The possible values of $Y$ are $\{0,4\}$.</li>
  <li>If $Y=0$, then $X=0$. If $Y=4$, then $X$ may be $-2$ or $2$, so $X$ cannot be determined.</li>
</ol>

</div>
</details>

</div>
</details>



## Section 5: PMFs and PDFs

<details class="collapsible">
<summary>Exercises</summary>
<div class="collapsible__content">

**Exercise 5.1**

Suppose the only values a random variable $X$ can take are $0$, $1$, and $2$, and its pmf satisfies

$$
p(0)=0.2, \qquad p(1)=k, \qquad p(2)=0.5.
$$

Find $k$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The values of a pmf must sum to one, so

$$
0.2+k+0.5=1,
$$

which gives $k=0.3$.

</div>
</details>


**Exercise 5.2**

For each list below, determine whether it could be the complete list of probabilities for a pmf. If it cannot, state which requirement fails.

<ol type="1">
  <li>$0.2, 0.3, 0.5$.</li>
  <li>$0, 0.4, 0.6$.</li>
  <li>$-0.1, 0.5, 0.6$.</li>
  <li>$0.1, 0.1, 0.8$.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Lists $(1)$, $(2)$, and $(4)$ are valid because their entries are nonnegative and sum to one. List $(3)$ is invalid. Although its entries sum to one, it contains a negative probability.

</div>
</details>


**Exercise 5.3**

Suppose

$$
f(x)=
\begin{cases}
c, & 0 \leq x \leq 4,\\
0, & \text{otherwise}.
\end{cases}
$$

Find $c$ so that $f$ is a pdf.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The total area under a pdf must be one. Here the area is the width $4$ times the height $c$, so $4c=1$ and $c=1/4$.

</div>
</details>


**Exercise 5.4**

Suppose $X$ has pdf

$$
f(x)=
\begin{cases}
2x, & 0 \leq x \leq 1,\\
0, & \text{otherwise}.
\end{cases}
$$

Find $\mathbb P(X \leq 1/2)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

We integrate the pdf over the requested interval:

$$
\mathbb P(X \leq 1/2)=\int_0^{1/2}2x\,\mathrm dx
=\left.x^2\right|_0^{1/2}=\frac{1}{4}.
$$

</div>
</details>


**Exercise 5.5**

For each statement below, determine whether it must hold for a pdf $f$ of a continuous random variable $X$.

<ol type="I">
  <li>$f(x) \geq 0$ for every $x$.</li>
  <li>$\int_{-\infty}^{\infty} f(x)\,\mathrm dx=1$.</li>
  <li>$f(x) \leq 1$ for every $x$.</li>
  <li>$\mathbb P(X=a)=0$ for every fixed $a$.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Statements I, II, and IV must hold. Statement III need not hold. A pdf must be nonnegative and have total area one. Its value may be greater than one as long as its total area is one. For a continuous random variable, the probability at any one fixed value is zero.

</div>
</details>

**Exercise 5.6**

A continuous walking time $T$ has the following interval probabilities.

<table style="border-collapse: collapse; margin: 1rem auto;">
  <tr>
    <th style="border: 1px solid black; padding: 6px;">Interval</th>
    <th style="border: 1px solid black; padding: 6px;">$0\leq T<2$</th>
    <th style="border: 1px solid black; padding: 6px;">$2\leq T<5$</th>
    <th style="border: 1px solid black; padding: 6px;">$5\leq T\leq10$</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">Probability</td>
    <td style="border: 1px solid black; padding: 6px;">$0.30$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.45$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.25$</td>
  </tr>
</table>

<ol type="a">
  <li>Find $\mathbb P(T<5)$.</li>
  <li>Can the table alone determine $\mathbb P(3<T<4)$?</li>
  <li>Now suppose that, conditional on $T$ lying in any listed interval, $T$ is uniform on that interval. Find $\mathbb P(3<T<4)$.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="a">
  <li>$\mathbb P(T<5)=0.30+0.45=0.75$.</li>
  <li>No. The table gives the total probability in $[2,5)$ but does not say how that probability is distributed within the interval.</li>
  <li>The interval $[2,5)$ has width $3$, so its density height is $0.45/3=0.15$. The interval $(3,4)$ has width $1$, so its probability is $0.15$.</li>
</ol>

</div>
</details>


**Exercise 5.7**

Suppose $T$ is uniform on $[0,10]$.

<ol type="a">
  <li>Find $\mathbb P(T=4)$.</li>
  <li>If $T$ is rounded to the nearest whole number, find the probability that the recorded value is $4$.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="a">
  <li>Because $T$ is continuous, $\mathbb P(T=4)=0$.</li>
  <li>The recorded value is $4$ when $3.5\leq T<4.5$. This interval has length $1$ inside an interval of length $10$, so the probability is $1/10$.</li>
</ol>

</div>
</details>


**Exercise 5.8**

Suppose

$$
f(x)=
\begin{cases}
c, & 0\leq x\leq1,\\
2c, & 1<x\leq2,\\
0, & \text{otherwise}.
\end{cases}
$$

<ol type="a">
  <li>Find $c$ so that $f$ is a pdf.</li>
  <li>Find $\mathbb P(X>1)$.</li>
  <li>Find $\mathbb P(0.5<X\leq1.5)$.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="a">
  <li>The total area is $c(1)+2c(1)=3c$, so $c=1/3$.</li>
  <li>$\mathbb P(X>1)=(2c)(1)=2/3$.</li>
  <li>The interval from $0.5$ to $1$ has probability $(0.5)c=1/6$, and the interval from $1$ to $1.5$ has probability $(0.5)(2c)=1/3$. Thus, $\mathbb P(0.5<X\leq1.5)=1/2$.</li>
</ol>

</div>
</details>

**Exercise 5.9**

Suppose $X$ takes only the values $0$, $1$, and $2$, and its pmf satisfies

$$
p(1)=2p(0)
\qquad\text{and}\qquad
p(2)=2p(1).
$$

Find the pmf.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Let $p(0)=c$. Then $p(1)=2c$ and $p(2)=4c$. Since the probabilities sum to one,

$$
c+2c+4c=7c=1.
$$

Therefore,

$$
p(0)=\frac17,\qquad
p(1)=\frac27,\qquad
p(2)=\frac47.
$$

</div>
</details>


**Exercise 5.10**

A nonnegative function $f$ is zero outside an interval of length $2$ and satisfies $f(x)\leq0.4$ everywhere. Can $f$ be a pdf?

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

No. Its total area is at most

$$
(2)(0.4)=0.8,
$$

but a pdf must have total area $1$.

</div>
</details>


**Exercise 5.11**

Suppose a continuous random variable $X$ has a pdf satisfying

$$
f(-x)=f(x)
$$

for every real number $x$. Find $\mathbb P(X<0)$ and $\mathbb P(X>0)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The symmetry gives equal probability on the negative and positive half-lines. Since $X$ is continuous, $\mathbb P(X=0)=0$. The two probabilities therefore sum to one, so

$$
\mathbb P(X<0)=\mathbb P(X>0)=\frac12.
$$

</div>
</details>


**Exercise 5.12**

Suppose a pdf satisfies $f(x)\leq2$ for $1\leq x\leq1.1$. What is the largest value that the given information permits for $\mathbb P(1\leq X\leq1.1)$?

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The interval has length $0.1$, so its area under the pdf is at most

$$
(0.1)(2)=0.2.
$$

Thus, the largest permitted probability is $0.2$.

</div>
</details>

</div>
</details>



## Section 6: CDFs

<details class="collapsible">
<summary>Exercises</summary>
<div class="collapsible__content">

**Exercise 6.1**

For each property below, state whether every CDF must satisfy it.

<ol type="1">
  <li>Its values lie between $0$ and $1$.</li>
  <li>It is nondecreasing.</li>
  <li>It approaches $1$ as $x \to \infty$.</li>
  <li>It is differentiable everywhere.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The first three properties are required. Differentiability everywhere is not required. A CDF may have jumps.

</div>
</details>


**Exercise 6.2**

Suppose $X$ has the following pmf.

<table style="border-collapse: collapse; margin: 1rem auto;">
  <tr>
    <th style="border: 1px solid black; padding: 6px;">$x$</th>
    <th style="border: 1px solid black; padding: 6px;">$0$</th>
    <th style="border: 1px solid black; padding: 6px;">$1$</th>
    <th style="border: 1px solid black; padding: 6px;">$2$</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">$p(x)$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.2$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.3$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.5$</td>
  </tr>
</table>

Find $F(1)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

By definition,

$$
F(1)=\mathbb P(X \leq 1)=\mathbb P(X=0)+\mathbb P(X=1)=0.2+0.3=0.5.
$$

</div>
</details>


**Exercise 6.3**

Let $X$ be integer-valued, and let $F$ be its CDF. Express $\mathbb P(X<4)$ in terms of $F$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Since $X$ is integer-valued, $X<4$ is the same event as $X\leq 3$. Therefore,

$$
\mathbb P(X<4)=\mathbb P(X\leq 3)=F(3).
$$

</div>
</details>


**Exercise 6.4**

Suppose $F(2)=0.35$ and $F(5)=0.80$. Find $\mathbb P(2<X\leq 5)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

We subtract the probability accumulated through $2$ from the probability accumulated through $5$:

$$
\mathbb P(2<X\leq 5)=F(5)-F(2)=0.80-0.35=0.45.
$$

</div>
</details>


**Exercise 6.5**

Suppose the CDF of $X$ is

$$
F(x)=
\begin{cases}
0, & x<0,\\
0.2, & 0\leq x<1,\\
0.6, & 1\leq x<2,\\
1, & x\geq 2.
\end{cases}
$$

Find $p(0)$, $p(1)$, and $p(2)$. Explain why the pmf values are given by changes in the CDF rather than by the displayed CDF values themselves.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The probability at each value is the amount by which the CDF increases there. Thus, $p(0)=0.2$, $p(1)=0.6-0.2=0.4$, and $p(2)=1-0.6=0.4$. A CDF value is the total probability at or below a point, while a pmf value is only the new probability added at that point.

</div>
</details>

**Exercise 6.6**

Suppose $X$ takes only the values $0$, $1$, $2$, and $3$, and its CDF has the following values.

<table style="border-collapse: collapse; margin: 1rem auto;">
  <tr>
    <th style="border: 1px solid black; padding: 6px;">$x$</th>
    <th style="border: 1px solid black; padding: 6px;">$0$</th>
    <th style="border: 1px solid black; padding: 6px;">$1$</th>
    <th style="border: 1px solid black; padding: 6px;">$2$</th>
    <th style="border: 1px solid black; padding: 6px;">$3$</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">$F(x)$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.30$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.65$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.90$</td>
    <td style="border: 1px solid black; padding: 6px;">$1$</td>
  </tr>
</table>

<ol type="a">
  <li>Find the pmf of $X$.</li>
  <li>Which value of $X$ is most likely?</li>
  <li>Find $F(1.5)$.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="a">
  <li>The pmf values are the increases in the CDF:
  $$
  p(0)=0.30,\quad
  p(1)=0.35,\quad
  p(2)=0.25,\quad
  p(3)=0.10.
  $$</li>
  <li>The most likely value is $1$, which has probability $0.35$.</li>
  <li>Since $X$ has no possible value between $1$ and $2$, $F(1.5)=F(1)=0.65$.</li>
</ol>

</div>
</details>


**Exercise 6.7**

Let $F$ be the CDF of $X$, and let $a<b$.

<ol type="a">
  <li>Express $\mathbb P(a<X\leq b)$ in terms of $F$.</li>
  <li>Express $\mathbb P(X>a)$ in terms of $F$.</li>
  <li>If $X$ is integer-valued, express $\mathbb P(2\leq X\leq5)$ in terms of $F$.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="a">
  <li>$\mathbb P(a<X\leq b)=F(b)-F(a)$.</li>
  <li>$\mathbb P(X>a)=1-F(a)$.</li>
  <li>For an integer-valued random variable,
  $$
  \mathbb P(2\leq X\leq5)=F(5)-F(1).
  $$</li>
</ol>

</div>
</details>


**Exercise 6.8**

Suppose $X$ is integer-valued and $F(2)=0.70$.

<ol type="a">
  <li>Does this imply that $\mathbb P(X=2)=0.70$?</li>
  <li>What probability does $F(2)$ represent?</li>
  <li>Write $\mathbb P(X=2)$ using values of $F$.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="a">
  <li>No.</li>
  <li>$F(2)=\mathbb P(X\leq2)=0.70$.</li>
  <li>$\mathbb P(X=2)=F(2)-F(1)$.</li>
</ol>

</div>
</details>

**Exercise 6.9**

Suppose $X\leq Y$ for every outcome. For a fixed real number $t$:

<ol type="a">
  <li>Which of the events $\{X\leq t\}$ and $\{Y\leq t\}$ is contained in the other?</li>
  <li>How are $F_X(t)$ and $F_Y(t)$ ordered?</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

If $Y\leq t$, then $X\leq Y\leq t$. Therefore,

$$
\{Y\leq t\}\subseteq\{X\leq t\}.
$$

Taking probabilities gives

$$
F_Y(t)\leq F_X(t).
$$

</div>
</details>


**Exercise 6.10**

Suppose $F(2)=0.70$ and $\mathbb P(X<2)=0.45$. Find $\mathbb P(X=2)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The event $\{X\leq2\}$ is the disjoint union of $\{X<2\}$ and $\{X=2\}$. Thus,

$$
\mathbb P(X=2)
=F(2)-\mathbb P(X<2)
=0.70-0.45
=0.25.
$$

</div>
</details>


**Exercise 6.11**

Suppose $a<b$ and $F(a)=F(b)$. Find $\mathbb P(a<X\leq b)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Using the CDF difference,

$$
\mathbb P(a<X\leq b)
=F(b)-F(a)
=0.
$$

</div>
</details>


**Exercise 6.12**

Let $Y=2X+3$, and let $F_X$ be the CDF of $X$. Express the CDF $F_Y(y)$ in terms of $F_X$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Since the coefficient of $X$ is positive,

$$
\begin{split}
F_Y(y)
&=\mathbb P(Y\leq y)\\
&=\mathbb P(2X+3\leq y)\\
&=\mathbb P\left(X\leq\frac{y-3}{2}\right)\\
&=F_X\left(\frac{y-3}{2}\right).
\end{split}
$$

</div>
</details>

</div>
</details>



## Section 7: Expectation and Variance

<details class="collapsible">
<summary>Exercises</summary>
<div class="collapsible__content">

**Exercise 7.1**

Suppose $X=0$ with probability $0.25$ and $X=2$ with probability $0.75$. Find $\mathbb E[X]$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Using the definition of expectation,

$$
\mathbb E[X]=(0)(0.25)+(2)(0.75)=1.5.
$$

</div>
</details>


**Exercise 7.2**

Suppose $\mathbb E[X]=10$, $\operatorname{Var}(X)=4$, and $Y=3X-2$. Find $\mathbb E[Y]$ and $\operatorname{Var}(Y)$. Explain how multiplying by $3$ and subtracting $2$ affect these quantities.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

We have

$$
\mathbb E[Y]=3\mathbb E[X]-2=28
$$

and


$$
\operatorname{Var}(Y)=3^2\operatorname{Var}(X)=9(4)=36.
$$

Multiplying by $3$ multiplies the mean by $3$ and the variance by $9$. Subtracting $2$ decreases the mean by $2$ but does not change the variance.

</div>
</details>


**Exercise 7.3**

Let $Y=X+5$. Determine how this transformation changes the mean, variance, and standard deviation.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Adding a constant shifts every value without changing the spread. Thus,

$$
\mathbb E[Y]=\mathbb E[X]+5, \qquad
\operatorname{Var}(Y)=\operatorname{Var}(X), \qquad
\operatorname{SD}(Y)=\operatorname{SD}(X).
$$

</div>
</details>


**Exercise 7.4**

Random variables $X$ and $Y$ both have mean $5$.

- $X$ is $0$ or $10$, each with probability $1/2$.
- $Y$ is $4$ or $6$, each with probability $1/2$.

Which random variable has the larger standard deviation? Explain without performing a full variance calculation.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

$X$ has the larger standard deviation. The values of $X$ are five units away from the common mean, while the values of $Y$ are only one unit away.

</div>
</details>


**Exercise 7.5**

Suppose $\mathbb E[X]=2$ and $\operatorname{Var}(X)=5$. Find $\mathbb E[X^2]$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Using

$$
\operatorname{Var}(X)=\mathbb E[X^2]-\left(\mathbb E[X]\right)^2,
$$

we get

$$
\mathbb E[X^2]=\operatorname{Var}(X)+\left(\mathbb E[X]\right)^2=5+2^2=9.
$$

</div>
</details>

**Exercise 7.6**

Consider three random variables.

- $X=3$ with probability $1$.
- $Y=0$ or $6$, each with probability $1/2$.
- $Z\sim\operatorname{Bin}(6,1/2)$.

<ol type="a">
  <li>Show that all three have expected value $3$.</li>
  <li>Find their variances.</li>
  <li>Order the variables from smallest to largest variance.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="a">
  <li>
  $$
  \mathbb E[X]=3,\qquad
  \mathbb E[Y]=(0)(1/2)+(6)(1/2)=3,\qquad
  \mathbb E[Z]=6(1/2)=3.
  $$</li>
  <li>
  $$
  \operatorname{Var}(X)=0,\qquad
  \operatorname{Var}(Y)=9,\qquad
  \operatorname{Var}(Z)=6(1/2)(1/2)=\frac32.
  $$</li>
  <li>
  $$
  \operatorname{Var}(X)<\operatorname{Var}(Z)<\operatorname{Var}(Y).
  $$</li>
</ol>

</div>
</details>


**Exercise 7.7**

A room has space for $9$ people. Suppose the expected number of people who arrive is $9$. Does this guarantee that the room will never be too small?

Give a random variable with expected value $9$ that is greater than $9$ with positive probability.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

No. For example, let $N=8$ with probability $1/2$ and $N=10$ with probability $1/2$. Then

$$
\mathbb E[N]=(8)(1/2)+(10)(1/2)=9,
$$

but

$$
\mathbb P(N>9)=\mathbb P(N=10)=\frac12.
$$

An expected value does not guarantee that the random variable always equals that value.

</div>
</details>


**Exercise 7.8**

A game pays $3X$ dollars and costs $5$ dollars to play. Suppose $\mathbb E[X]=2$.

<ol type="a">
  <li>Find the expected net winnings.</li>
  <li>What entry price would make the expected net winnings equal to $0$?</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Let $W=3X-5$ be the net winnings for the stated entry price.

<ol type="a">
  <li>$\mathbb E[W]=3\mathbb E[X]-5=3(2)-5=1$, so the expected net winnings are $1$ dollar.</li>
  <li>If the entry price is $c$, the expected net winnings are $3\mathbb E[X]-c=6-c$. They equal $0$ when $c=6$, so the entry price is $6$ dollars.</li>
</ol>

</div>
</details>

**Exercise 7.9**

Suppose $\mathbb E[X]=3$ and $\mathbb E[Y]=-1$. Find

$$
\mathbb E[4X-2Y+5].
$$

Does the calculation require $X$ and $Y$ to be independent?

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Linearity of expectation gives

$$
\mathbb E[4X-2Y+5]
=4\mathbb E[X]-2\mathbb E[Y]+5
=4(3)-2(-1)+5
=19.
$$

Independence is not required for linearity of expectation.

</div>
</details>


**Exercise 7.10**

There are eight events, each with probability $1/4$. Let $N$ be the number of these events that occur. Find $\mathbb E[N]$. The events do not have to be independent.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Let $I_j$ be $1$ when event $j$ occurs and $0$ otherwise. Then

$$
N=I_1+\cdots+I_8.
$$

Each indicator has expectation $1/4$, so linearity gives

$$
\mathbb E[N]
=\sum_{j=1}^{8}\mathbb E[I_j]
=8\left(\frac14\right)
=2.
$$

No independence assumption is needed.

</div>
</details>


**Exercise 7.11**

Suppose $X_1,\ldots,X_4$ are independent, each with mean $6$ and variance $9$. Let

$$
M=\frac{X_1+\cdots+X_4}{4}.
$$

Find $\mathbb E[M]$ and $\operatorname{Var}(M)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

By linearity of expectation,

$$
\mathbb E[M]
=\frac{1}{4}\sum_{j=1}^{4}\mathbb E[X_j]
=\frac{1}{4}(4)(6)
=6.
$$

Independence makes the variances of the four terms additive. Therefore,

$$
\operatorname{Var}(M)
=\frac{1}{16}\sum_{j=1}^{4}\operatorname{Var}(X_j)
=\frac{1}{16}(4)(9)
=\frac94.
$$

</div>
</details>


**Exercise 7.12**

Suppose $\mathbb E[X]=4$ and $\mathbb E[X^2]<\infty$. Find the smallest possible value of $\mathbb E[X^2]$. When is this value attained?

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Since variance is nonnegative,

$$
\mathbb E[X^2]
=\operatorname{Var}(X)+\left(\mathbb E[X]\right)^2
\geq4^2
=16.
$$

Equality holds exactly when $\operatorname{Var}(X)=0$, which means that $X=4$ with probability $1$.

</div>
</details>


**Exercise 7.13**

Assume the relevant expectations are finite. For each condition, compare $\mathbb E[X^2]$ with $\mathbb E[X]$.

<ol type="a">
  <li>$0\leq X\leq1$ for every outcome.</li>
  <li>$X$ takes only nonnegative integer values.</li>
  <li>No restriction is placed on the values of $X$.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="a">
  <li>For $0\leq X\leq1$, we have $X^2\leq X$ for every outcome. Therefore,
  $$
  \mathbb E[X^2]\leq\mathbb E[X].
  $$</li>
  <li>For every nonnegative integer $x$, $x^2\geq x$. Therefore,
  $$
  \mathbb E[X^2]\geq\mathbb E[X].
  $$</li>
  <li>Neither ordering is guaranteed. If $X=1/2$ with probability $1$, then $\mathbb E[X^2]=1/4<1/2=\mathbb E[X]$. If $X=2$ with probability $1$, then $\mathbb E[X^2]=4>2=\mathbb E[X]$.</li>
</ol>

</div>
</details>


**Exercise 7.14**

For each pair of stated moments, determine whether such a random variable can exist.

<ol type="a">
  <li>$\mathbb E[X]=3$ and $\mathbb E[X^2]=8$.</li>
  <li>$\mathbb E[X]=3$ and $\mathbb E[X^2]=9$.</li>
</ol>

If the second pair is possible, determine what it implies about $X$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="a">
  <li>This pair is impossible because it would give
  $$
  \operatorname{Var}(X)
  =\mathbb E[X^2]-\left(\mathbb E[X]\right)^2
  =8-9
  =-1,
  $$
  but variance cannot be negative.</li>
  <li>This pair is possible, but it gives
  $$
  \operatorname{Var}(X)=9-9=0.
  $$
  Therefore, $X=3$ with probability $1$.</li>
</ol>

</div>
</details>

</div>
</details>



## Section 8: Joint Distributions

<details class="collapsible">
<summary>Exercises</summary>
<div class="collapsible__content">

**Exercise 8.1**

The joint pmf of $X$ and $Y$ is given below. Find $k$.

<table style="border-collapse: collapse; margin: 1rem auto;">
  <tr>
    <th style="border: 1px solid black; padding: 6px;"></th>
    <th style="border: 1px solid black; padding: 6px;">$Y=0$</th>
    <th style="border: 1px solid black; padding: 6px;">$Y=1$</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">$X=0$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.1$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.2$</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">$X=1$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.3$</td>
    <td style="border: 1px solid black; padding: 6px;">$k$</td>
  </tr>
</table>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

All entries in a joint pmf must sum to one, so

$$
0.1+0.2+0.3+k=1,
$$

which gives $k=0.4$.

</div>
</details>


**Exercise 8.2**

The joint pmf of $X$ and $Y$ is given below.

<table style="border-collapse: collapse; margin: 1rem auto;">
  <tr>
    <th style="border: 1px solid black; padding: 6px;"></th>
    <th style="border: 1px solid black; padding: 6px;">$Y=0$</th>
    <th style="border: 1px solid black; padding: 6px;">$Y=1$</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">$X=0$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.2$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.3$</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">$X=1$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.1$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.4$</td>
  </tr>
</table>

Find $\mathbb P(X=1)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

We add the probabilities for all outcomes with $X=1$:

$$
\mathbb P(X=1)=\mathbb P(X=1,Y=0)+\mathbb P(X=1,Y=1)=0.1+0.4=0.5.
$$

</div>
</details>


**Exercise 8.3**

Suppose $\mathbb P(X=1,Y=1)=0.4$ and $\mathbb P(Y=1)=0.7$. Find $\mathbb P(X=1 \,|\, Y=1)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The probability that $Y=1$ is given as $0.7$, so

$$
\mathbb P(X=1 \,|\, Y=1)
=\frac{\mathbb P(X=1,Y=1)}{\mathbb P(Y=1)}
=\frac{0.4}{0.7}
=\frac{4}{7}.
$$

</div>
</details>


**Exercise 8.4**

Consider the following joint pmf.

<table style="border-collapse: collapse; margin: 1rem auto;">
  <tr>
    <th style="border: 1px solid black; padding: 6px;"></th>
    <th style="border: 1px solid black; padding: 6px;">$Y=0$</th>
    <th style="border: 1px solid black; padding: 6px;">$Y=1$</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">$X=0$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.12$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.28$</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">$X=1$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.18$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.42$</td>
  </tr>
</table>

Determine whether $X$ and $Y$ are independent. Compute the needed marginal probabilities and justify your conclusion.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The probabilities for $X=0$ and $X=1$ are $0.4$ and $0.6$, while the probabilities for $Y=0$ and $Y=1$ are $0.3$ and $0.7$. Every table entry is the product of its corresponding marginal probabilities. For example,

$$
\mathbb P(X=0,Y=0)=0.12=(0.4)(0.3).
$$

The same check works for the other three entries, so $X$ and $Y$ are independent.

</div>
</details>


**Exercise 8.5**

Suppose $X$ and $Y$ have joint pdf

$$
f(x,y)=
\begin{cases}
c, & 0\leq x\leq 1 \text{ and } 0\leq y\leq 1,\\
0, & \text{otherwise}.
\end{cases}
$$

<ol type="a">
  <li>Find $c$.</li>
  <li>Find $\mathbb P(X\leq 1/2, Y\leq 1/2)$.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

The full square has area one, so the density must have height $c=1$ for the total probability to equal one. Within the support, the event $X\leq 1/2$ and $Y\leq 1/2$ is a square with area

$$
\left(\frac{1}{2}\right)\left(\frac{1}{2}\right)=\frac{1}{4}.
$$

Since the density is $1$ on this square, the probability is also $1/4$.

</div>
</details>

**Exercise 8.6**

Let $X$ be equally likely to be $0$ or $1$. Consider three models for $Y$.

- Model I: $Y=X$.
- Model II: $Y=1-X$.
- Model III: Each of the four pairs $(0,0)$, $(0,1)$, $(1,0)$, and $(1,1)$ is equally likely to be $(X,Y)$.

<ol type="a">
  <li>Find the marginal distribution of $Y$ in each model.</li>
  <li>Find $\mathbb P(X=1,Y=1)$ in each model.</li>
  <li>In which model are $X$ and $Y$ independent?</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="a">
  <li>In every model, $\mathbb P(Y=0)=\mathbb P(Y=1)=1/2$.</li>
  <li>The probabilities are $1/2$ in Model I, $0$ in Model II, and $1/4$ in Model III.</li>
  <li>Only Model III gives independence. Models I and II have the same marginal distributions as Model III, but the relationship between $X$ and $Y$ is different.</li>
</ol>

</div>
</details>


**Exercise 8.7**

The joint pmf of $X$ and $Y$ is

<table style="border-collapse: collapse; margin: 1rem auto;">
  <tr>
    <th style="border: 1px solid black; padding: 6px;"></th>
    <th style="border: 1px solid black; padding: 6px;">$Y=0$</th>
    <th style="border: 1px solid black; padding: 6px;">$Y=1$</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">$X=0$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.3$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.2$</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">$X=1$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.1$</td>
    <td style="border: 1px solid black; padding: 6px;">$0.4$</td>
  </tr>
</table>

<ol type="a">
  <li>Find the marginal distributions of $X$ and $Y$.</li>
  <li>Find $\mathbb P(Y=1\mid X=1)$.</li>
  <li>Determine whether $X$ and $Y$ are independent.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="a">
  <li>
  $$
  \mathbb P(X=0)=0.5,\quad \mathbb P(X=1)=0.5,
  $$
  and
  $$
  \mathbb P(Y=0)=0.4,\quad \mathbb P(Y=1)=0.6.
  $$</li>
  <li>
  $$
  \mathbb P(Y=1\mid X=1)=\frac{0.4}{0.5}=0.8.
  $$</li>
  <li>They are not independent because
  $$
  \mathbb P(X=1,Y=1)=0.4
  \neq(0.5)(0.6)
  =\mathbb P(X=1)\mathbb P(Y=1).
  $$</li>
</ol>

</div>
</details>


**Exercise 8.8**

Suppose $X$ and $Y$ are independent and each is uniform on $[0,1]$.

<ol type="a">
  <li>Find $\mathbb P(X<Y)$.</li>
  <li>Find $\mathbb P(X>Y)$.</li>
  <li>Find $\mathbb P(X=Y)$.</li>
</ol>

Do not use a double integral.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Because $X$ and $Y$ are independent and have the same uniform distribution, their joint distribution is unchanged when $X$ and $Y$ are exchanged. Therefore, the events $X<Y$ and $X>Y$ have equal probability. Their joint distribution is continuous, so $\mathbb P(X=Y)=0$. Since exactly one of these three events occurs,

$$
\mathbb P(X<Y)=\mathbb P(X>Y)=\frac12
$$

and

$$
\mathbb P(X=Y)=0.
$$

</div>
</details>

**Exercise 8.9**

Suppose

$$
\operatorname{Var}(X)=4,\qquad
\operatorname{Var}(Y)=9,\qquad
\operatorname{Cov}(X,Y)=-2.
$$

Find $\operatorname{Var}(2X-Y)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Using the variance rule for a linear combination,

$$
\begin{split}
\operatorname{Var}(2X-Y)
&=2^2\operatorname{Var}(X)+(-1)^2\operatorname{Var}(Y)
+2(2)(-1)\operatorname{Cov}(X,Y)\\
&=4(4)+9-4(-2)\\
&=33.
\end{split}
$$

</div>
</details>


**Exercise 8.10**

Suppose

$$
\operatorname{Var}(X)=6
\qquad\text{and}\qquad
\operatorname{Cov}(X,Y)=-1.
$$

Find

$$
\operatorname{Cov}(3X+2,\,2Y-X-5).
$$

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Adding constants does not change covariance. Expanding the covariance of the remaining terms gives

$$
\begin{split}
\operatorname{Cov}(3X+2,\,2Y-X-5)
&=\operatorname{Cov}(3X,\,2Y-X)\\
&=6\operatorname{Cov}(X,Y)-3\operatorname{Var}(X)\\
&=6(-1)-3(6)\\
&=-24.
\end{split}
$$

</div>
</details>


**Exercise 8.11**

Suppose

$$
\operatorname{Var}(X)=16
\qquad\text{and}\qquad
\operatorname{Var}(Y)=9.
$$

Find the full range of possible values of $\operatorname{Cov}(X,Y)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

For any two random variables with finite variances,

$$
\left|\operatorname{Cov}(X,Y)\right|
\leq
\sqrt{\operatorname{Var}(X)\operatorname{Var}(Y)}.
$$

Here,

$$
\sqrt{(16)(9)}=12,
$$

so

$$
-12\leq\operatorname{Cov}(X,Y)\leq12.
$$

Every value in this interval can occur. To see this, let $Z$ and $W$ be independent random variables with variance $1$. For any $t\in[-1,1]$, define

$$
X=4Z
\qquad\text{and}\qquad
Y=3\left(tZ+\sqrt{1-t^2}\,W\right).
$$

Then $\operatorname{Var}(X)=16$, $\operatorname{Var}(Y)=9$, and

$$
\operatorname{Cov}(X,Y)=12t.
$$

As $t$ ranges from $-1$ to $1$, the covariance ranges from $-12$ to $12$.

</div>
</details>


**Exercise 8.12**

Suppose $\operatorname{Var}(X)=16$ and $\operatorname{Var}(Y)=9$, but the relationship between $X$ and $Y$ is unknown. Find the full range of possible values of $\operatorname{Var}(X+Y)$.

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

We have

$$
\operatorname{Var}(X+Y)
=16+9+2\operatorname{Cov}(X,Y).
$$

From Exercise 8.11, the covariance can range from $-12$ to $12$. Therefore,

$$
25-24
\leq\operatorname{Var}(X+Y)
\leq25+24,
$$

so

$$
1\leq\operatorname{Var}(X+Y)\leq49.
$$

The examples in Exercise 8.11 attain the two endpoints.

</div>
</details>


**Exercise 8.13**

Let $X$ take the values $-1$, $0$, and $1$, each with probability $1/3$, and let $Y=X^2$.

<ol type="a">
  <li>Find $\operatorname{Cov}(X,Y)$.</li>
  <li>Determine whether
  $$
  \operatorname{Var}(X+Y)
  =\operatorname{Var}(X)+\operatorname{Var}(Y).
  $$</li>
  <li>Are $X$ and $Y$ independent?</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

We have

$$
\mathbb E[X]=0
\qquad\text{and}\qquad
\mathbb E[XY]=\mathbb E[X^3]=0.
$$

Therefore,

$$
\operatorname{Cov}(X,Y)
=\mathbb E[XY]-\mathbb E[X]\mathbb E[Y]
=0.
$$

It follows that

$$
\operatorname{Var}(X+Y)
=\operatorname{Var}(X)+\operatorname{Var}(Y).
$$

However, $X$ and $Y$ are not independent. For example,

$$
\mathbb P(X=0,Y=0)=\frac13,
$$

while

$$
\mathbb P(X=0)\mathbb P(Y=0)
=\frac13\cdot\frac13
=\frac19.
$$

Thus, zero covariance does not imply independence.

</div>
</details>


**Exercise 8.14**

Suppose $X$ and $Y$ take only the values $0$ and $1$, with

$$
\mathbb P(X=1)=0.60
\qquad\text{and}\qquad
\mathbb P(Y=1)=0.70.
$$

<ol type="a">
  <li>Find the full range of possible values of $\mathbb P(X=1,Y=1)$.</li>
  <li>Find the full range of possible values of $\operatorname{Cov}(X,Y)$.</li>
</ol>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

Let $q=\mathbb P(X=1,Y=1)$. The intersection bounds give

$$
\max\{0,0.60+0.70-1\}
\leq q\leq
\min\{0.60,0.70\},
$$

so

$$
0.30\leq q\leq0.60.
$$

Because $X$ and $Y$ are $0$-$1$ variables,

$$
\mathbb E[XY]=q,\qquad
\mathbb E[X]=0.60,\qquad
\mathbb E[Y]=0.70.
$$

Thus,

$$
\operatorname{Cov}(X,Y)
=q-(0.60)(0.70)
=q-0.42.
$$

Therefore,

$$
-0.12\leq\operatorname{Cov}(X,Y)\leq0.18.
$$

</div>
</details>

</div>
</details>



<!--

<ol type="i">
  <li>property 1.</li>
  <li>property 2.</li>
  <li>property 3.</li>
</ol>








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
