<div class="solution-visibility" data-show-solutions="false"></div>

## Joint Distributions

A joint distribution describes how two random variables behave together.

### Discrete Joint Distributions

<div class="callout definition">
<div class="label">Definition: Joint Probability Mass Function</div>

Let $X$ and $Y$ be discrete random variables with supports $\mathcal X$ and $\mathcal Y$. Their ***joint probability mass function*** $p_{X, Y}(x, y): \mathbb R^2 \rightarrow [0, 1]$ is

$$
p_{X,Y}(x, y) := \mathbb P(X = x, Y = y).
$$

</div>

A valid joint pmf must satisfy:

<ol type="i">
  <li>Nonnegative probability for all values in the domain:

  $$
  p_{X,Y}(x, y) \geq 0\quad \text{for every }x \in \mathcal X, y \in \mathcal Y.
  $$
  </li>
  <li> The probabilities sum to 1 over all values $X$ and $Y$ can take:

  $$
  \sum_{x \in \mathcal X} \sum_{y \in \mathcal Y} p_{X,Y}(x, y) = 1.
  $$
  </li>
</ol>


When we write $\mathbb P(X = x, Y = y)$, the comma is an "and," denoting intersection: $\mathbb P(X = x, Y = y) = \mathbb P(\{X = x\} \cap \{Y = y\})$.


### Continuous Joint Distributions

<div class="callout definition">
<div class="label">Definition: Joint Probability Density Function</div>

Let $X$ and $Y$ be continuous random variables. Their ***joint probability density function*** $f_{X,Y}:\mathbb R^2 \to [0, \infty)$ satisfies

$$
\int_{-\infty}^{\infty} \int_{-\infty}^{\infty}
f_{X,Y}(x, y) \, \mathrm dy \, \mathrm dx = 1
$$

and, for any region $D \subseteq \mathbb R^2$ for which the integral is defined,

$$
\mathbb P\big((X, Y) \in D\big)
= \iint_D f_{X,Y}(x, y) \, \mathrm dx \, \mathrm dy.
$$

When such a function exists, the random variables $X$ and $Y$ are called ***jointly continuous***.

</div>

As with a one-dimensional pdf, the value $f_{X,Y}(x, y)$ is a density, not a probability. In particular, we still have that

$$
\mathbb P(X = x, Y = y) = 0
$$

for any particular pair $(x, y)$ when $(X, Y)$ is jointly continuous.



The region $D$ can be simple or complicated. The simplest case is a rectangular region: for the intervals $[a_1, b_1]$ and $[a_2, b_2]$, the probability over this region would be

$$
\mathbb P\big((X, Y) \in [a_1, b_1] \times [a_2, b_2]\big) = \mathbb P(\{X \in [a_1, b_1]\} \cap \{Y \in [a_2, b_2]\}).
$$

If the region $D$ is more complicated, for example, a triangle, perhaps we would see

$$
\mathbb P\big((X, Y) \in \{(x, y) \in \mathbb R^2 : x \in [0, 1], y \in [0, x]\}\big).
$$

Or perhaps if $D$ is a disk of radius one centered at the origin, we would have

$$
\mathbb P\big((X, Y) \in \{(x, y) \in \mathbb R^2 : x^2 + y^2 \leq 1\}\big).
$$


### Joint Cumulative Distribution Functions

<div class="callout definition">
<div class="label">Definition: Joint Cumulative Distribution Function</div>

Let $X$ and $Y$ be random variables. Their ***joint cumulative distribution function*** is

$$
F_{X,Y}(x, y) := \mathbb P(X \leq x, Y \leq y).
$$


</div>

For discrete random variables,

$$
F_{X,Y}(x, y)
= \sum_{s \leq x} \sum_{t \leq y} p_{X,Y}(s, t).
$$

For jointly continuous random variables,

$$
F_{X,Y}(x, y)
= \int_{-\infty}^{x} \int_{-\infty}^{y}
f_{X,Y}(s, t) \, \mathrm dt \, \mathrm ds.
$$

<div class="callout proposition">
<div class="label">Proposition: Properties of a Joint CDF</div>

Every joint CDF satisfies the following properties.

<ol type="i">
  <li>The CDF is bounded above by one and bounded below by zero: 
  
  $$
  0 \leq F_{X,Y}(x, y) \leq 1.
  $$</li>
  <li>$F_{X,Y}(x, y)$ is nondecreasing in each input when the other input is held fixed. This means that
  
  $$
  F_{X, Y}(x_1, y) \leq F_{X, Y}(x_2, y) \quad \text{for } x_1 < x_2,
  $$
  
  $$
  F_{X, Y}(x, y_1) \leq F_{X, Y}(x, y_2) \quad \text{for } y_1 < y_2.
  $$
  </li>
  <li>$F_{X,Y}(x, y)$ is right-continuous in each input.</li>
  <li>For any fixed $x$ and $y$, we have

  $$
  \lim_{s \to -\infty}F_{X,Y}(s, y) = 0,
  \qquad
  \lim_{t \to -\infty}F_{X,Y}(x, t) = 0,
  $$

  and

  $$
  \lim_{x \to \infty}\lim_{y \to \infty}F_{X,Y}(x, y) = 1.
  $$
  </li>
  <li>For any $a_1 < b_1$ and $a_2 < b_2$,

  $$
  \begin{split}
  \mathbb P(a_1 < X \leq b_1, a_2 < Y \leq b_2)
  ={}&F_{X,Y}(b_1, b_2)-F_{X,Y}(a_1, b_2)-F_{X,Y}(b_1, a_2)+F_{X,Y}(a_1, a_2).
  \end{split}
  $$

  </li>
</ol>

</div>





## Marginal Distributions

A joint distribution, in addition to describing how two random variables vary together, also uniquely defines the *marginal* distribution of each random variable&mdash;the distribution of that variable by itself&mdash;which is what we were working with before introducing joint distributions. 

Specifically, we can compute each variable's distribution by summing or integrating over every possible value of the other variable.

<div class="callout definition">
<div class="label">Definition: Marginal PMFs and PDFs</div>

If $X$ and $Y$ are discrete with joint pmf $p_{X,Y}$, then their ***marginal pmfs*** are

$$
p_X(x) = \sum_{y \in \mathcal Y} p_{X,Y}(x, y),
\qquad
p_Y(y) = \sum_{x \in \mathcal X} p_{X,Y}(x, y).
$$

If $X$ and $Y$ are jointly continuous with joint pdf $f_{X,Y}$, then their ***marginal pdfs*** are

$$
f_X(x) = \int_{-\infty}^{\infty} f_{X,Y}(x, y) \, \mathrm dy,
\qquad
f_Y(y) = \int_{-\infty}^{\infty} f_{X,Y}(x, y) \, \mathrm dx.
$$

</div>

How do we know what sort of object we get back after summing or integrating over one of the variables? Does it fulfill all the requirements of a distribution that we discussed when we were only looking at one variable at a time?

The answer is yes: every marginal distribution is a completely valid probability distribution.

<div class="callout proposition">
<div class="label">Proposition: Marginals Are Valid Distributions</div>

Every marginal obtained from a valid joint distribution is itself a valid distribution. In the discrete case,

$$
p_X(x) \geq 0,
\qquad
\sum_x p_X(x) = 1,
$$

and similarly for $p_Y$. 

In the continuous case,

$$
f_X(x) \geq 0,
\qquad
\int_{-\infty}^{\infty} f_X(x) \, \mathrm dx = 1,
$$

and similarly for $f_Y$.

The marginal CDFs can also be recovered from the joint CDF similarly:

$$
F_X(x) = \lim_{y \to \infty}F_{X,Y}(x, y),
\qquad
F_Y(y) = \lim_{x \to \infty}F_{X,Y}(x, y).
$$

</div>

We've looked at the joint and marginal CDFs, pmfs, and pdfs. What about expectation? Can we talk about expectations for joint distributions?

Yes. But the target changes: we can't sum or take integrals over ordered pairs $(x, y)$ like we do scalars. What can we take expectations of? It turns out that if we define a function $g : \mathbb R^2 \to \mathbb R$ which takes in two values but outputs only one, we can take the expectation of this function $g(X, Y)$ using the joint pmf or pdf for $X$ and $Y$.

<div class="callout definition">
<div class="label">Definition: Expectation of a Function of Two Random Variables</div>

Let $g : \mathbb R^2 \rightarrow \mathbb R$ be a function of two random variables $X$ and $Y$. 

If $X$ and $Y$ are discrete, then we define the expectation

$$
\mathbb E[g(X, Y)]
:= \sum_x \sum_y g(x, y)p_{X,Y}(x, y),
$$

provided this value is finite. 

If $X$ and $Y$ are jointly continuous, then

$$
\mathbb E[g(X, Y)]
:= \int_{-\infty}^{\infty} \int_{-\infty}^{\infty}
g(x, y)f_{X,Y}(x, y) \, \mathrm dy \, \mathrm dx,
$$

provided this value is finite.

</div>


<!--
<div class="callout example">
<div class="label">Example: A Joint PDF on a Triangle</div>

Suppose the joint pdf of $X$ and $Y$ has the form

$$
f_{X,Y}(x, y)
=
\begin{cases}
c, & 0 < y < x < 1, \\
0, & \text{otherwise}.
\end{cases}
$$

<ol type="i">
  <li>Find $c$.</li>
  <li>Find the marginal pdfs $f_X$ and $f_Y$.</li>
  <li>Verify that both marginal pdfs integrate to one.</li>
  <li>Find $\mathbb P(Y < X/2)$.</li>
  <li>Find $F_{X,Y}(3/4, 1/2)$.</li>
</ol>

</div>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="i">
  <li>The joint density must integrate to one. Therefore,

  $$
  1
  = \int_0^1 \int_0^x c \, \mathrm dy \, \mathrm dx
  = \int_0^1 cx \, \mathrm dx
  = \frac{c}{2},
  $$

  so $c = 2$.
  </li>
  <li>For $0 < x < 1$,

  $$
  f_X(x)
  = \int_0^x 2 \, \mathrm dy
  = 2x.
  $$

  For $0 < y < 1$, the restriction $y < x < 1$ gives

  $$
  f_Y(y)
  = \int_y^1 2 \, \mathrm dx
  = 2(1-y).
  $$

  Both marginal densities are zero outside $(0, 1)$.
  </li>
  <li>We have

  $$
  \int_0^1 2x \, \mathrm dx = 1
  $$

  and

  $$
  \int_0^1 2(1-y) \, \mathrm dy = 1.
  $$
  </li>
  <li>The event $Y < X/2$ lies inside the triangular support, so

  $$
  \mathbb P(Y < X/2)
  = \int_0^1 \int_0^{x/2} 2 \, \mathrm dy \, \mathrm dx
  = \int_0^1 x \, \mathrm dx
  = \frac{1}{2}.
  $$
  </li>
  <li>For $0 < x \leq 1/2$, the upper bound for $y$ is $x$. For $1/2 < x \leq 3/4$, the upper bound is $1/2$. Thus,

  $$
  \begin{split}
  F_{X,Y}(3/4, 1/2)
  & = \int_0^{1/2} \int_0^x 2 \, \mathrm dy \, \mathrm dx
  +\int_{1/2}^{3/4} \int_0^{1/2} 2 \, \mathrm dy \, \mathrm dx\\
  & = \frac{1}{4}+\frac{1}{4}
  = \frac{1}{2}.
  \end{split}
  $$
  </li>
</ol>

</div>
</details>

-->


## Independence, Covariance, and Correlation

Marginal distributions describe $X$ and $Y$ separately. They do not, by themselves, tell us how $X$ and $Y$ behave together.

<div class="callout definition">
<div class="label">Definition: Independence of Random Variables</div>

Random variables $X$ and $Y$ are ***independent*** if

$$
F_{X,Y}(x, y) = F_X(x)F_Y(y)
$$

for every $x, y \in \mathbb R$.

</div>

<div class="callout proposition">
<div class="label">Proposition: PMF/PDF of Independent Random Variables</div>

Suppose random variables $X$ and $Y$ are independent.

If $X$ and $Y$ are discrete, taking values in $\mathcal X \times \mathcal Y$, then

$$
p_{X,Y}(x, y) = p_X(x)p_Y(y)
$$

for every pair $(x, y) \in \mathbb R^2$.

If $X$ and $Y$ are jointly continuous, then

$$
f_{X,Y}(x, y) = f_X(x)f_Y(y)
$$

for every $(x, y) \in \mathbb R^2$.


</div>


<div class="callout example">
<div class="label">Example: Joint Distributions with Equivalent Marginals</div>

For some $q$, suppose $X$ and $Y$ have the following joint pmf.

<table style="border-collapse: collapse; margin: 1rem auto;">
  <tr>
    <th style="border: 1px solid black; padding: 6px;"></th>
    <th style="border: 1px solid black; padding: 6px;">$Y = 0$</th>
    <th style="border: 1px solid black; padding: 6px;">$Y = 1$</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">$X = 0$</td>
    <td style="border: 1px solid black; padding: 6px;">$q$</td>
    <td style="border: 1px solid black; padding: 6px;">$1/2-q$</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">$X = 1$</td>
    <td style="border: 1px solid black; padding: 6px;">$1/2-q$</td>
    <td style="border: 1px solid black; padding: 6px;">$q$</td>
  </tr>
</table>

<ol type="i">
  <li>Find the range of possible values for $q$.</li>
  <li>Find the marginal pmfs. Do they depend on $q$?</li>
  <li>For which value of $q$ are $X$ and $Y$ independent?</li>
</ol>

</div>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="i">
  <li>All four probabilities are nonnegative and no greater than one exactly when

  $$
  0 \leq q \leq \frac{1}{2}.
  $$

  The four entries sum to one for every $q$.
  </li>
  <li>Each row and each column sums to $1/2$. Therefore,

  $$
  \mathbb P(X = 1) = \mathbb P(Y = 1) = \frac{1}{2},
  $$

  and neither marginal depends on $q$.
  </li>
  <li>If the variables are independent, then we must have that

  $$
  \mathbb P(X = 1, Y = 1)
  = \mathbb P(X = 1)\mathbb P(Y = 1)
  = \frac{1}{4}.
  $$

  Therefore, independence occurs when $q = 1/4$. At this value, all four cells equal $1/4$, so the factorization in the definition holds for every ordered pair of values.

  Alternatively, one may think of it as: all columns have the same probabilities, i.e. the cells in any column are the same across all rows; and all rows have the same probabilities, i.e. the cells in any row are the same across all columns. Therefore, knowing the value of one of the random variables does *not* change the probabilities over the values the other random variable can take.
  </li>
</ol>

</div>
</details>


### Covariance

<div class="callout definition">
<div class="label">Definition: Covariance</div>

For two random variables $X$ and $Y$, their ***covariance*** is defined as

$$
\operatorname{Cov}(X, Y)
:= \mathbb E\left[(X-\mathbb E[X])(Y-\mathbb E[Y])\right].
$$

</div>

We can compute the covariance depending on whether $X$ and $Y$ have a continuous or discrete joint distribution.

If they are jointly discrete, then the covariance is computed as

$$
\operatorname{Cov}(X, Y) = \sum_x \sum_y (x - \mathbb E[X])(y - \mathbb E[Y])p_{X, Y}(x, y).
$$

If they are jointly continuous, the covariance is computed as

$$
\operatorname{Cov}(X, Y) = \int_{-\infty}^\infty\int_{-\infty}^\infty (x - \mathbb E[X])(y - \mathbb E[Y]) f_{X, Y}(x, y) \,\mathrm dx \,\mathrm dy.
$$

Instead of using the definition directly, we can also write it more simply, as we did with the variance.

<div class="callout proposition">
<div class="label">Proposition: Moment Representation of Covariance</div>

For two random variables $X$ and $Y$, their covariance can equivalently be written as

$$
\operatorname{Cov}(X, Y)
:= \mathbb E[XY] - \mathbb E[X]\mathbb E[Y].
$$

</div>

Therefore, using this simplified formula, a discrete joint distribution has covariance computed as

$$
\operatorname{Cov}(X, Y)
= \sum_x \sum_y
x\cdot y\cdot p_{X,Y}(x, y) - \left(\sum_x x\cdot p_X(x)\right)\left(\sum_y y\cdot p_Y(y) \right).
$$

For a continuous joint distribution, the covariance is computed as

$$
\operatorname{Cov}(X, Y)
= \int_{-\infty}^\infty \int_{-\infty}^\infty
x\cdot y \cdot f_{X, Y}(x, y)\,\mathrm dx\,\mathrm dy - \left(\int_{-\infty}^\infty x \cdot f_X(x) \, \mathrm dx\right)\left(\int_{-\infty}^\infty y \cdot f_Y(y) \,\mathrm dy\right).
$$

How do we interpret covariance? From the definition, we're weighting the product $(x - \mathbb E[X])(y - \mathbb E[Y])$ by its probability or density. Let's think about the *sign* of the covariance first. If it's positive, we see that $(x - \mathbb E[X])$ and $(y - \mathbb E[Y])$ have the same sign on average&mdash;together, they're more likely to be both large or both small.

However, we note that the magnitude of the covariance is not as easy to interpret if we only care about the relationship between these two variables. To communicate only the information about how related these two variables are with one another, we introduce the *correlation*.


### Correlation

<div class="callout definition">
<div class="label">Definition: Correlation</div>

For two random variables $X, Y$ with positive variances, their ***correlation*** is defined as

$$
\rho = \operatorname{Corr}(X, Y)
:= \frac{\operatorname{Cov}(X, Y)}{
\sqrt{\operatorname{Var}(X)}\sqrt{\operatorname{Var}(Y)}}.
$$

</div>

Correlation has no units, since we're dividing by the standard deviations, and it tells you only how strongly two random variables are linearly related and the direction of this relationship.

What can the correlation tell us? Because correlation has the same sign as covariance, positive correlation means that larger values of \(X\) tend to occur with larger values of \(Y\), while negative correlation means that larger values of \(X\) tend to occur with smaller values of \(Y\).

What about zero?

<div class="callout example">
<div class="label">Example: Zero Covariance and Correlation vs. Independence</div>

Let's look again at an example from last week's class. Let $X$ take the values $-1$, $0$, and $1$, each with probability $1/3$, and define

$$
Y := X^2.
$$

<ol type="i">
  <li>Find $\mathbb E[X]$, $\mathbb E[Y]$, and $\mathbb E[XY]$.</li>
  <li>Find $\operatorname{Cov}(X, Y)$.</li>
  <li>Are $X$ and $Y$ independent?</li>
</ol>

</div>


<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="i">
  <li>We have

  $$
  \mathbb E[X] = \frac{1}{3}(-1) + \frac13(0) + \frac13(1) = 0.
  $$

  Alternatively, since the distribution is symmetric, we can immediately say that the expectation is zero. Next,

  $$
  \mathbb E[Y]
  = \frac{1}{3}(1+0+1)
  = \frac{2}{3},
  $$

  and

  $$
  \mathbb E[XY]
  = \mathbb E[X^3]
  = \frac{1}{3}(-1+0+1)
  = 0.
  $$
  </li>
  <li> Directly using the formula, we have that

  $$
  \operatorname{Cov}(X, Y)
  = \mathbb E[XY]-\mathbb E[X]\mathbb E[Y]
  = 0.
  $$

  Note that this means that the correlation is also zero, since both random variables have nonzero variance.
  </li>
  <li>No, they are *not* independent. Independence requires the conditional probabilities to be equal to the marginals. For example,

  $$
  \mathbb P(Y = 0\mid X = 0) = 1,
  $$

  while

  $$
  \mathbb P(Y = 0) = \frac{1}{3}.
  $$

  Hence, knowing the value of $X$ changes the distribution of $Y$, so the variables are dependent even though their covariance is zero.
  </li>
</ol>

</div>
</details>




<div class="callout remark">
<div class="label">Remark: Covariance and Independence</div>

Independence implies zero covariance (and hence also zero correlation, when defined). The reverse, however, is not true, as can be seen in the example above: two random variables can have zero covariance but still not be independent.

Further remark: for two variables that are jointly Gaussian, it turns out that zero covariance/correlation *does* imply independence. But this is a special case and the statement is not generally true.

</div>

<div class="callout remark">
<div class="label">Remark: Correlation and Causation</div>

It would be remiss to not include the classic line: correlation does not imply causation. It's possible that one variable causes another to be more likely, but the reverse could be true, or neither&mdash;perhaps a third variable is causing both.

</div>


<div class="callout example">
<div class="label">Example: Covariance with Fixed Marginals</div>

Let's return to the joint pmf from the previous example for random variables $X$ and $Y$.

<table style="border-collapse: collapse; margin: 1rem auto;">
  <tr>
    <th style="border: 1px solid black; padding: 6px;"></th>
    <th style="border: 1px solid black; padding: 6px;">$Y = 0$</th>
    <th style="border: 1px solid black; padding: 6px;">$Y = 1$</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">$X = 0$</td>
    <td style="border: 1px solid black; padding: 6px;">$q$</td>
    <td style="border: 1px solid black; padding: 6px;">$1/2-q$</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">$X = 1$</td>
    <td style="border: 1px solid black; padding: 6px;">$1/2-q$</td>
    <td style="border: 1px solid black; padding: 6px;">$q$</td>
  </tr>
</table>

<ol type="i">
  <li>Find $\operatorname{Cov}(X, Y)$ and $\operatorname{Corr}(X, Y)$ in terms of $q$.</li>
  <li>For which values of $q$ is the correlation positive, zero, or negative?</li>
</ol>

</div>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="i">
  <li>Since $X$ and $Y$ take values zero and one,

  $$
  \mathbb E[XY] = \mathbb P(X = 1, Y = 1) = q.
  $$

  Therefore,

  $$
  \operatorname{Cov}(X, Y)
  = q-\left(\frac{1}{2}\right)\left(\frac{1}{2}\right)
  = q-\frac{1}{4}.
  $$

  Both variables have variance $1/4$, so

  $$
  \operatorname{Corr}(X, Y)
  = \frac{q-1/4}{\sqrt{(1/4)(1/4)}}
  = 4q-1.
  $$
  </li>
  <li>The correlation is negative when $0 \leq q < 1/4$, zero when $q = 1/4$, and positive when $1/4 < q \leq 1/2$.</li>
</ol>

</div>
</details>


<div class="callout example">
<div class="label">Example: Using Covariance Rules</div>

Suppose

$$
\operatorname{Var}(X) = 4,
\qquad
\operatorname{Var}(Y) = 9,
\qquad
\operatorname{Cov}(X, Y) = -2.
$$

<ol type="i">
  <li>Find $\operatorname{Corr}(X, Y)$.</li>
  <li>Find $\operatorname{Var}(X+Y)$.</li>
  <li>Find $\operatorname{Var}(3X-2Y)$.</li>
  <li>Find $\operatorname{Cov}(2X+5, Y-4)$.</li>
  <li>Could $\operatorname{Cov}(X, Y)$ have been $-7$ instead of $-2$ with the stated variances?</li>
  <li>If $W = -3Y+10$, find $\operatorname{Corr}(X, W)$.</li>
</ol>

</div>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="i">
  <li>We are given the covariance and both variances, so we directly use the definition of correlation to obtain

  $$
  \operatorname{Corr}(X, Y)
  = \frac{-2}{(2)(3)}
  = -\frac{1}{3}.
  $$
  </li>
  <li> We use the identity $\operatorname{Var}(X + Y) = \operatorname{Var}(X) + \operatorname{Var}(Y) + 2\operatorname{Cov}(X, Y)$ to obtain

  $$
  \operatorname{Var}(X+Y)
  = 4+9+2(-2)
  = 9.
  $$
  </li>
  <li> We use the same identity as above and also the variance/covariance identities to obtain

  $$
  \operatorname{Var}(3X-2Y)
  = 3^2(4)+(-2)^2(9)+2(3)(-2)(-2)
  = 36+36+24
  = 96.
  $$
  </li>
  <li>Adding constants does not affect covariance, so

  $$
  \operatorname{Cov}(2X+5, Y-4)
  = 2\operatorname{Cov}(X, Y)
  = -4.
  $$
  </li>
  <li>No. The covariance bound gives

  $$
  \left|\operatorname{Cov}(X, Y)\right|
  \leq \sqrt{(4)(9)} = 6.
  $$
  </li>
  <li>Multiplying one variable by a negative constant reverses the sign of the correlation. Therefore,

  $$
  \operatorname{Corr}(X, W) = \frac{1}{3}.
  $$
  </li>
</ol>

</div>
</details>



## Conditional Distributions

A conditional distribution describes how one random variable is distributed after we have learned the value of another random variable.

<div class="callout definition">
<div class="label">Definition: Conditional PMF</div>

Let $X$ and $Y$ be discrete random variables. For any $x$ such that $p_X(x) > 0$, the ***conditional pmf*** of $Y$ given $X = x$ is

$$
p_{Y\mid X}(y\mid x)
:= \frac{p_{X,Y}(x, y)}{p_X(x)}.
$$

</div>

<div class="callout proposition">
<div class="label">Proposition: The Conditional PMF is a Valid PMF</div>

Let $X$ and $Y$ be discrete random variables. For any $x$ such that $p_X(x) > 0$, the conditional pmf is a valid pmf. This means that

$$
p_{Y\mid X}(y\mid x) \geq 0, \qquad
\sum_y p_{Y\mid X}(y\mid x) = 1.
$$

</div>





<div class="callout definition">
<div class="label">Definition: Conditional PDF</div>

Let $X$ and $Y$ be jointly continuous. For any $x$ such that $f_X(x) > 0$, the ***conditional pdf*** of $Y$ given $X = x$ is

$$
f_{Y\mid X}(y\mid x)
:= \frac{f_{X,Y}(x, y)}{f_X(x)}.
$$

</div>

<div class="callout proposition">
<div class="label">Proposition: The Conditional PDF is a Valid PDF</div>

Let $X$ and $Y$ be jointly continuous random variables. For any fixed $x$ with $f_X(x) > 0$,

$$
f_{Y\mid X}(y\mid x) \geq 0, \qquad
\int_{-\infty}^{\infty} f_{Y\mid X}(y\mid x) \, \mathrm dy = 1.
$$


</div>

<div class="callout definition">
<div class="label">Definition: Conditional CDF</div>

For any fixed $x$ for which the conditional distribution is defined, the ***conditional CDF*** of $Y$ given $X = x$ is

$$
F_{Y\mid X}(y\mid x)
:= \mathbb P(Y \leq y\mid X = x).
$$

</div>

In the discrete case, this can be computed as

$$
F_{Y\mid X}(y\mid x)
= \sum_{t \leq y} p_{Y\mid X}(t\mid x).
$$

In the jointly continuous case, it can be computed as

$$
F_{Y\mid X}(y\mid x)
= \int_{-\infty}^{y} f_{Y\mid X}(t\mid x) \, \mathrm dt.
$$

Let's do some visualization for conditional pdfs.

First, let us look at a bivariate Gaussian distribution. This means that $X$ and $Y$ are jointly Gaussian. Suppose that $X$ and $Y$ are independent. What does this say about the correlation $\rho := \operatorname{Corr}(X, Y)$?

<a id="conditionals-visualization"></a>
<div class="bivariate-normal-slicer"
     data-instance-id="week5-bivariate-normal-uncorrelated-axis-v3"
     data-title="Conditional PDFs for an Uncorrelated Bivariate Gaussian"
     data-mean-x="0"
     data-mean-y="0"
     data-variance-x="4"
     data-variance-y="1"
     data-correlation="0"
     data-shared-side-plot-scale="true"
     data-initial-joint-y-maximum="0.1"
     data-initial-conditional-y-maximum="0.5">
  <p class="bns-fallback">Loading the interactive bivariate Gaussian model...</p>
</div>

We see that moving the "slice," which cuts a cross section out of the joint density, changes the joint pdf panel, but not the conditional density panel. This illustrates the important fact that the joint density evaluated at a specific $X = x$ or $Y = y$ does not necessarily produce a valid pdf for the other, unfixed variable. We must *normalize* with the marginal of the fixed variable to obtain a valid pdf. We see that the plot on the bottom, which illustrates the conditional pdf, is unchanging: if the conditional pdf does not change based on the value of the fixed variable, the two variables are independent.

Let's now take the same marginal distributions as above, meaning $X \sim \mathcal N(0, 2^2)$ and $Y \sim \mathcal N(0, 1)$, but this time with a positive correlation $\rho = 0.5$.

<div class="bivariate-normal-slicer"
     data-instance-id="week5-bivariate-normal-axis-v2"
     data-title="Conditional PDFs for a Correlated Bivariate Gaussian"
     data-mean-x="0"
     data-mean-y="0"
     data-variance-x="4"
     data-variance-y="1"
     data-correlation="0.5"
     data-initial-joint-y-maximum="0.12"
     data-initial-conditional-y-maximum="0.62">
  <p class="bns-fallback">Loading the interactive bivariate Gaussian model...</p>
</div>

What happens as I change where the slice happens? Does the conditional density, which is illustrated in the bottom panel, change? What does this mean for the independence (or lack thereof) between $X$ and $Y$?

Lastly, let's look at a really weird distribution&mdash;the joint density can be defined for any two jointly continuous random variables, however strange the function looks.

This example has a density that exhibits multiple modes. Does the conditional density change as I adjust the slider? What does this say about the independence between $X$ and $Y$?

<div class="bivariate-normal-slicer"
     data-instance-id="week5-multimodal-joint-density-zoom-v2"
     data-title="Conditional PDFs for a Multimodal Joint Distribution"
     data-distribution="multimodal"
     data-initial-joint-zoom="1.2"
     data-show-parameter-legend="false">
  <p class="bns-fallback">Loading the interactive multimodal joint-density model...</p>
</div>


<div class="callout proposition">
<div class="label">Proposition: Joint and Conditional Distributions</div>

The joint distribution can be recovered by multiplying a conditional distribution by the corresponding marginal distribution. For discrete random variables and any $x$ such that $p_X(x) > 0$,

$$
p_{X,Y}(x, y) = p_{Y\mid X}(y\mid x)p_X(x).
$$

For jointly continuous random variables and any $x$ such that $f_X(x) > 0$,

$$
f_{X,Y}(x, y) = f_{Y\mid X}(y\mid x)f_X(x).
$$

If $X$ and $Y$ are independent, conditioning on $X = x$ does not change the distribution of $Y$. Thus,

$$
p_{Y\mid X}(y\mid x) = p_Y(y)
$$

in the discrete case. In the jointly continuous case, the conditional and marginal densities satisfy

$$
f_{Y\mid X}(y\mid x) = f_Y(y)
$$

for every value of $x$ for which the corresponding conditional distribution is defined.

</div>

The direction of conditioning matters. In general,

$$
p_{Y\mid X}(y\mid x)
\neq
p_{X\mid Y}(x\mid y),
$$

because the two expressions divide the same joint pmf value by different marginal probabilities.


### Conditional Expectation and Variance

<div class="callout definition">
<div class="label">Definition: Conditional Expectation</div>

For discrete random variables and any $x$ such that $p_X(x) > 0$, provided the sum is finite,

$$
\mathbb E[Y\mid X = x]
:= \sum_y y\,p_{Y\mid X}(y\mid x).
$$

For jointly continuous random variables and any $x$ such that $f_X(x) > 0$, provided the integral is finite,

$$
\mathbb E[Y\mid X = x]
:= \int_{-\infty}^{\infty}
yf_{Y\mid X}(y\mid x) \, \mathrm dy.
$$

</div>


For a fixed value $x$, the quantity $\mathbb E[Y\mid X = x]$ is a number. As $x$ varies, it is a function of $x$. The notation $\mathbb E[Y\mid X]$ means that this function is evaluated at the random value $X$.

Note that whichever variable is integrated out no longer appears in the result. Because $\mathbb E[Y\,|\, X]$ integrates *over* $Y$ and *conditions on* $X$, we have that it ends up being a function of $X$ with no $Y$ appearing at all.

<div class="callout definition">
<div class="label">Definition: Conditional Variance</div>

For any fixed $x$ for which the conditional distribution is defined, provided $\mathbb E[Y^2\mid X = x] < \infty$, the ***conditional variance*** is

$$
\operatorname{Var}(Y\mid X = x)
:= \mathbb E\left[
\left(Y-\mathbb E[Y\mid X = x]\right)^2
\,\middle|\,X = x
\right].
$$

Equivalently,

$$
\operatorname{Var}(Y\mid X = x)
= \mathbb E[Y^2\mid X = x]
-\left(\mathbb E[Y\mid X = x]\right)^2.
$$

</div>

<div class="callout theorem">
<div class="label">Theorem: Law of Total Expectation</div>

Provided the expectations exist, we can first average within the groups defined by $X$ and then average across those groups. If $X$ is discrete,

$$
\mathbb E[Y]
= \sum_{x \in \mathcal X} \mathbb E[Y\mid X = x]p_X(x).
$$

If $X$ has a pdf $f_X$,

$$
\mathbb E[Y]
= \int_{-\infty}^{\infty}
\mathbb E[Y\mid X = x]f_X(x) \, \mathrm dx.
$$

The value assigned to $\mathbb E[Y\mid X = x]$ at any $x$ for which $f_X(x) = 0$ does not affect this integral.

Both formulas can be written compactly as

$$
\mathbb E[Y] = \mathbb E\left[\mathbb E[Y\mid X]\right].
$$

</div>





<div class="callout example">
<div class="label">Example: Conditional Quantities for a Joint PDF</div>

Consider the joint density

$$
f_{X,Y}(x, y)
=
\begin{cases}
2, & 0 < y < x < 1, \\
0, & \text{otherwise}.
\end{cases}
$$

<ol type="i">
  <li>Compute the marginal $f_X(x)$.</li>
  <li>Find $f_{Y\mid X}(y\mid x)$ for $0 < x < 1$.</li>
  <li>Verify that this conditional density integrates to one for each fixed $x$.</li>
  <li>Find $\mathbb E[Y\mid X = x]$ and $\operatorname{Var}(Y\mid X = x)$.</li>
  <li>Use the law of total expectation to find $\mathbb E[Y]$.</li>
</ol>

</div>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

<ol type="i">
  <li>We integrate out $y$ to find the marginal for $X$.

  $$
  f_X(x) = \int_{-\infty}^\infty f_{X,Y}(x,y) \,\mathrm dy = \int_{0}^x 2 \,\mathrm dy = (2y)\bigg|_0^x = 2x.
  $$

  Hence, we have that the marginal density is

  $$
  f_X(x) = \begin{cases}2x, & x \in (0, 1)\\0, & x \notin (0, 1)\end{cases}.
  $$
  </li>
  <li>For $0 < x < 1$,

  $$
  f_{Y\mid X}(y\mid x)
  = \frac{f_{X,Y}(x, y)}{f_X(x)}
  =
  \begin{cases}
  \dfrac{1}{x}, & 0 < y < x, \\
  0, & \text{otherwise}.
  \end{cases}
  $$
  </li>
  <li>Holding $x$ fixed,

  $$
  \int_{-\infty}^{\infty} f_{Y\mid X}(y\mid x) \, \mathrm dy
  = \int_0^x \frac{1}{x} \, \mathrm dy
  = 1.
  $$
  </li>
  <li>The conditional expectation is

  $$
  \mathbb E[Y\mid X = x]
  = \int_0^x y\left(\frac{1}{x}\right) \, \mathrm dy
  = \frac{x}{2}.
  $$

  Next, we have

  $$
  \mathbb E[Y^2\mid X = x]
  = \int_0^x y^2\left(\frac{1}{x}\right) \, \mathrm dy
  = \frac{x^2}{3}.
  $$

  Therefore,

  $$
  \operatorname{Var}(Y\mid X = x)
  = \frac{x^2}{3}-\left(\frac{x}{2}\right)^2
  = \frac{x^2}{12}.
  $$
  </li>
  <li>Using $f_X(x) = 2x$ on $(0, 1)$,

  $$
  \mathbb E[Y]
  = \int_0^1 \mathbb E[Y\mid X = x]f_X(x) \, \mathrm dx
  = \int_0^1 \left(\frac{x}{2}\right)(2x) \, \mathrm dx
  = \int_0^1 x^2 \, \mathrm dx
  = \frac{1}{3}.
  $$
  </li>
</ol>

</div>
</details>





<!--

<img src="figures/name" alt="Figure-Title" style="display:block; width:90%; max-width:600px; height:auto; margin:1rem auto;">




<div class="callout definition">
<div class="label">Definition: Object to Define</div>

Here is the definition. Here are the list of required properties:

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
