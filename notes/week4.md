<div class="solution-visibility" data-show-solutions="false"></div>

## Continuous Random Variables

Continuous random variables take uncountably many values, often intervals on $\mathbb R$: the nonnegative real line $[0, \infty)$, the entire real line $(-\infty, \infty)$, or some bounded interval $[a, b]$ for $-\infty <a < b < \infty$.

### Probability Density Functions


Continuous random variables, instead of a probability mass function, have a *probability density function*. Critically, the probability that a continuous random variable takes any value $x \in \mathbb R$ must be zero. This means that there must not be mass on any value in its image. This also means that the CDF of a continuous random variable is continuous, not just right-continuous.

Recall that, in physics, density is mass over volume. Similarly, we can think of the probability density as being the probability mass over a small window divided by the volume of that window. For example, for a random variable $X$ and a value $x \in \mathbb R$, while $\mathbb P(X = x) = 0$, the probability that $X$ takes values in a *tiny region around $x$*, such as $[x - \epsilon, x + \epsilon]$ for some small positive number $\epsilon$, can be positive. Dividing by the "volume," which in this case is the length of the interval, and taking $\epsilon \to 0$ lets us understand the density.

Therefore, unlike discrete random variables, the probability that a continuous random variable $X$ takes any value $x_1$ cannot be larger than the probability it takes the value $x_2$&mdash;these must both be zero. But $X$ can nevertheless be more *dense* around $x_1$ than $x_2$: meaning in the same size of tiny window, $X$ is more probable to be within the tiny window around $x_1$ than the tiny window around $x_2$.

The most important and commonly seen continuous random variable is the normal, or Gaussian, random variable.

<div class="callout definition">
<div class="label">Definition: Normal Distribution</div>

The ***normal distribution*** has two parameters: the mean and the positive variance. For a normally distributed random variable $X$, we write

$$
X \sim \mathcal N(\mu, \sigma^2),
$$

and $X$ has the probability density function

$$
f(x) = \frac{1}{\sqrt{2\pi\sigma^2}} \exp\left\{-\frac{1}{2}\left(\frac{x - \mu}{\sigma}\right)^2\right\}.
$$

</div>

Let's look at some other continuous distributions that are less fundamental than the normal distribution but often still useful.

<div class="callout definition">
<div class="label">Definition: Uniform Distribution</div>

The ***uniform distribution*** has uniform density on an interval. The two parameters of the uniform distribution are therefore the endpoints: for a uniformly distributed random variable $X$, we write, for $a, b \in \mathbb R$ such that $a < b$,

$$
X \sim \operatorname{Uniform}([a, b]),
$$

and $X$ has the probability density function

$$
f(x) = \mathbf 1_{[a, b]}(x) \left(\frac{1}{b - a}\right).
$$

</div>

The symbol $\mathbf 1_{[a, b]}(x)$ simply means that it takes the value $1$ if $x \in [a, b]$ and zero otherwise.

<div class="callout definition">
<div class="label">Definition: Exponential Distribution</div>

The ***exponential distribution*** has only one parameter. For an exponentially distributed random variable $X$, we write, for $\lambda > 0$,

$$
X \sim \operatorname{Exponential}(\lambda),
$$

and $X$ has the probability density function

$$
f(x) = \mathbf 1_{[0, \infty)}(x) \lambda e^{-\lambda x}.
$$

</div>

### Cumulative Distribution Functions

The CDF is defined precisely the same way as previously.

<div class="callout definition">
<div class="label">Definition: Cumulative Distribution Function</div>

Let $X$ be a random variable. The ***cumulative distribution function*** of $X$ is defined as

$$
F(x) := \mathbb P(X \leq x).
$$

</div>

Recall that we could calculate the CDF from the pmf for discrete random variables. Similarly, we can calculate the CDF from the pdf for continuous random variables. Suppose a continuous random variable has pdf $f(x)$. Then we have that

$$
F(x) = \int_{-\infty}^x f(t) \, \mathrm dt.
$$

Essentially, we integrate the pdf up to point $x$. This gives us the probability that $X \leq x$.

Let's do some practice.

<div class="callout example">
<div class="label">Example: CDF of the Exponential Distribution</div>

Recall that the pdf of a random variable $X$ that is exponentially distributed is 

$$
f(x) = \mathbf 1_{[0, \infty)}(x) \lambda e^{-\lambda x}.
$$


<ol type="1">
  <li>Calculate the CDF of $X$. Recall that this is calculating the area in the shaded region visualized below.

<img src="figures/w4-exps-1.png" alt="Bounded-Region" style="display:block; width:95%; max-width:400px; height:auto; margin:1rem auto;">

</li>
  <li>What if we wanted to calculate the probability $\mathbb P(x_1 \leq X \leq x_2)$ instead, where $0 \leq x_1 \leq x_2$?

  <img src="figures/w4-exps-2.png" alt="Bounded-Region" style="display:block; width:95%; max-width:400px; height:auto; margin:1rem auto;">
  </li>
</ol>


</div>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

We use the integral formula for computing the CDF from the pdf. 

<ol type="1">
<li>We have

$$
F(x) = \int_{0}^x \lambda e^{-\lambda t} \, \mathrm dt = \lambda \int_{0}^x e^{-\lambda t} \, \mathrm dt = \left(-e^{-\lambda t} \right)\bigg |_{0}^x = 1 - e^{-\lambda x}, \qquad x \geq 0.
$$

Note that the lower bound of integration is zero, since the pdf is zero for values less than zero.
Hence, we have

$$
F(x) = \mathbf 1_{[0, \infty)}(x) (1 - e^{-\lambda x}).
$$

</li>

<li>There are two strategies here. Either we can just use the CDF we computed above and write

$$
\mathbb P(x_1 \leq X \leq x_2) = F(x_2) - F(x_1) = \left(1 - e^{-\lambda x_2}\right) - \left(1 - e^{-\lambda x_1}\right) = e^{-\lambda x_1} - e^{-\lambda x_2},
$$

or we could integrate over the corresponding region directly to get

$$
\mathbb P(x_1 \leq X \leq x_2) = \int_{x_1}^{x_2} \lambda e^{-\lambda t} \, \mathrm dt = \left(-e^{-\lambda t} \right)\bigg |_{x_1}^{x_2} = e^{-\lambda x_1} - e^{-\lambda x_2},
$$

which gives us the same answer.
</li>
</ol>


</div>
</details>



## Expectation and Variance for Continuous RVs

The expectation and variance for a continuous random variable are quite similar to those for a discrete random variable. We simply switch out the pmf with the pdf, then switch out the sum with an integral.

### Expectation

We start, as always, with the definition.

<div class="callout definition">
<div class="label">Definition: Expectation of a Continuous RV</div>

Let $X$ be a continuous random variable taking values in $\mathcal X$ with pdf $f(x)$. Then the ***expectation*** of $X$, if it exists, is

$$
\mathbb E[X] := \int_{-\infty}^\infty f(x)\cdot x \,\mathrm dx.
$$

</div>


### Variance

The variance is defined precisely the same way as before.

<div class="callout definition">
<div class="label">Definition: Variance of a Continuous RV</div>

Let $X$ be a continuous random variable taking values in $\mathcal X$ with pdf $f(x)$ and $\mathbb E[X^2] < \infty$. Then the ***variance*** of $X$ is

$$
\operatorname{Var}(X) := \mathbb E[(X - \mathbb E[X])^2].
$$

</div>

Again, the variance can be written as

$$
\operatorname{Var}(X) = \mathbb E[X^2] - \left(\mathbb E[X]\right)^2.
$$

The exact formula, written out in integral form, would be

$$
\operatorname{Var}(X) = \int_{-\infty}^\infty f(x) \cdot x^2 \, \mathrm dx - \left(\int_{-\infty}^\infty f(x) \cdot x \, \mathrm dx\right)^2.
$$



<div class="callout example">
<div class="label">Example: Expectation and Variance of the Exponential Distribution</div>


Write down the integrals needed to compute:

<ol type="1">
<li>The expectation of an exponentially distributed random variable $X$.</li>
<li>The variance of $X$.</li>
</ol>

</div>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

We'll write the integral and also compute it out.

<ol type="1">
<li>Using the definition, we have

$$
\mathbb E[X] = \int_{0}^\infty x \lambda e^{-\lambda x} \, \mathrm dx.
$$

Computing this using integration by parts, we have

$$
\mathbb E[X] = \left(-xe^{-\lambda x}\right) \bigg |_{0}^{\infty}
  + \int_{0}^{\infty} e^{-\lambda x}\, \mathrm dx
= 0 + \left(-\frac{1}{\lambda}e^{-\lambda x}\right) \bigg |_{0}^{\infty}
= \frac{1}{\lambda}.
$$
</li>

<li>For the variance, using the easier formula, we have

$$
\operatorname{Var}(X) = \int_0^\infty x^2 \lambda e^{-\lambda x} \, \mathrm dx - \left(\int_0^\infty x \lambda e^{-\lambda x} \, \mathrm dx\right)^2.
$$

Computing this using iterated integration by parts for the first term, we have

$$
\int_0^\infty x^2 \lambda e^{-\lambda x} \, \mathrm dx
=
\left[-x^2e^{-\lambda x}\right]_0^\infty
+
2\int_0^\infty xe^{-\lambda x} \, \mathrm dx
=
\frac{2}{\lambda}
\int_0^\infty x\lambda e^{-\lambda x} \, \mathrm dx
=
\frac{2}{\lambda^2}.
$$

We can simply square the expectation and subtract it off, giving us that the variance is
$$
\operatorname{Var}(X)
=
\frac{2}{\lambda^2}
-
\left(\frac{1}{\lambda}\right)^2
=
\frac{1}{\lambda^2}.
$$
</li>
</ol>
</div>
</details>





## The Normal Distribution

The normal distribution, also called the Gaussian distribution (named after the mathematician Gauss), is arguably the most fundamental probability distribution in mathematics, statistics, and probably any science.

### The Standard Normal Distribution

The standard normal has mean zero and variance one. It can be thought of as the "target" or "reference" to which we can compare any other normal distribution. We gave the pdf of the general $\mathcal N(\mu, \sigma^2)$ above, and using $\mu = 0, \sigma^2 = 1$, we have the density for the standard normal:

$$
f(z) = \frac{1}{\sqrt{2\pi}} \exp\left\{-\frac{1}{2}z^2\right\}.
$$

Why do we have a "standard" normal? It turns out that any other normal distribution with parameters $\mu, \sigma^2$ can easily be translated back to the standard normal. It's therefore easier to have a single "version" of the normal distribution as the one everyone references, since it's so easy to translate back and forth between normals. If you know the probability that a standard normal falls within a given range, it turns out that you can calculate the probability that any other normal falls within the corresponding range.

Typically, then, if we want to learn something about a non-standard normal, we'll translate it into a standard normal and do our computations with that instead.



<div class="callout proposition">
<div class="label">Proposition: Symmetry of the Standard Normal</div>

An important property of the standard normal distribution is that it's ***symmetric*** around zero. This means that, for $Z \sim \mathcal N(0, 1)$, we have that

$$
\mathbb P(Z < -z) = \mathbb P(Z > z).
$$

</div>

This can be seen by using $z = 1.5$ in the figures below.

<div style="display:flex; justify-content:center; align-items:flex-start; gap:4rem; margin:1rem auto; width:100%;">

  <img src="figures/w4-geq-1.5.png"
       alt="P(Z greater than 1.5)"
       style="flex:1 1 0; min-width:0; max-width:350px; height:auto;">

  <img src="figures/w4-leq-neg-1.5.png"
       alt="P(Z less than negative 1.5)"
       style="flex:1 1 0; min-width:0; max-width:350px; height:auto;">

</div>

The two shaded regions have equal area under the curve.

The standard normal distribution is such an important reference that many statisticians and statistics practitioners have memorized some important standard-normal probabilities.

<div class="callout proposition">
<div class="label">Proposition: Empirical Rule</div>

Let $Z$ be a standard normal random variable. Then

$$
\mathbb P(-1 < Z < 1) \approx .68, \qquad \mathbb P(-2 < Z < 2) \approx .95, \qquad \mathbb P(-3 < Z < 3) \approx .997.
$$

This gives the probabilities that $Z$ lies within one, two, and three standard deviations, respectively.

</div>

Equipped with some basics on the standard normal, let's talk about how to translate other normal distributions into the standard normal.

We start with an arbitrary normal distribution $X \sim \mathcal N(\mu, \sigma^2)$ for some $\mu \in \mathbb R$ and $\sigma^2 > 0$.

The first step is centering. What do we need to do to $X$ to make it centered at zero? We subtract off the mean. If $X \sim \mathcal N(\mu, \sigma^2)$, then $X - \mu \sim \mathcal N(0, \sigma^2)$. This shifts the entire distribution to the center.

The second step is scaling. What do we need to do to $X$ to make it correctly scaled? We divide by the standard deviation, $\sigma$. If $X - \mu \sim \mathcal N(0, \sigma^2)$, then $(X - \mu)/\sigma \sim \mathcal N(0, 1)$. This rescales the entire distribution around the center.

Therefore, we have the following result.

<div class="callout proposition">
<div class="label">Proposition: Standardizing the Normal Distribution</div>

For any normally distributed random variable $X \sim \mathcal N(\mu, \sigma^2)$ with $\sigma^2 > 0$, we have that

$$
\left(\frac{X - \mu}{\sigma}\right) \sim \mathcal N(0, 1).
$$

</div>

<div class="callout remark">
<div class="label">Remark: Standardizing the Normal Distribution</div>

Note that the form for standardization is subtracting the mean then dividing by the standard deviation,

$$
\frac{X - \mu}{\sigma}.
$$

Is this form familiar? Look at the pdf for $X \sim \mathcal N(\mu, \sigma^2)$:

$$
f(x) = \frac{1}{\sqrt{2\pi\sigma^2}} \exp\left\{-\frac{1}{2}\left(\frac{x - \mu}{\sigma}\right)^2\right\}.
$$

Subtracting off the mean and dividing by the standard deviation appears right in the formula! Wild.

</div>

Let's do some practice now. Recall that the standard normal distribution is our target/reference. Let's denote the CDF of a standard normal $Z \sim \mathcal N(0, 1)$ as

$$
\Phi(z) := \mathbb P(Z \leq z).
$$


<div class="callout example">
<div class="label">Example: Using the Standard Gaussian</div>

Suppose I have a random variable $X$ that is normally distributed with mean 5 and variance 4. Using the standard normal CDF $\Phi$, write the following probabilities.

<ol type="i">
  <li>The probability $\mathbb P(X \leq 8)$.</li>
  <li>The probability $\mathbb P(X > 1)$.</li>
  <li>The probability $\mathbb P(1 < X \leq 8)$.</li>
  <li>Do the strict/nonstrict inequalities matter here?</li>
</ol>

*Hint: we can think of calculating the probabilities $\mathbb P(X > x)$ and $\mathbb P(X < x)$ by checking how many standard deviations $x$ is from the mean, and then asking ourselves what the probability is that $X$ is that far away.*

</div>

<details class="collapsible">
<summary>Solution</summary>
<div class="collapsible__content">

We first do the linear transformation to standardize. We have that the mean is 5 and the standard deviation is $\sqrt{4} = 2$, so the random variable

$$
\frac{X - 5}{2} \sim \mathcal N(0, 1).
$$

<ol type="i">
  <li>We have that
  
  $$
  \mathbb P(X \leq 8) = \mathbb P\left(\frac{X - 5}{2} \leq \frac{8 - 5}{2}\right) = \mathbb P(Z \leq 1.5).
  $$

  The last quantity can be directly expressed using the CDF, and we have $\Phi(1.5)$.
  </li>
  <li>We have
  
  $$
  \mathbb P(X > 1) = \mathbb P\left(\frac{X - 5}{2} > \frac{1 - 5}{2}\right) = \mathbb P(Z > -2).
  $$

  The last quantity $\mathbb P(Z > -2)$ is equivalent to $1 - \mathbb P(Z \leq -2)$, and we get the CDF representation $1 - \Phi(-2)$.
  
  The visualization for the two probabilities above is given in the figure below.
  
  <div style="display:flex; justify-content:center; align-items:flex-start; gap:4rem; margin:1rem auto; width:100%;">

  <img src="figures/w4-leq-1.5.png"
       alt="P(Z less than 1.5)"
       style="flex:1 1 0; min-width:0; max-width:350px; height:auto;">

  <img src="figures/w4-geq-neg-2.png"
       alt="P(Z greater than negative 2)"
       style="flex:1 1 0; min-width:0; max-width:350px; height:auto;">

</div></li>
  <li>To obtain the last probability, we have to identify two different regions.

  <img src="figures/w4-leq-1.5-geq-neg-2.png" alt="Bounded-Region" style="display:block; width:95%; max-width:600px; height:auto; margin:1rem auto;">
  
  First is $\mathbb P(Z < 1.5)$. We already have this, $\Phi(1.5)$. Next, we also need to subtract off $\mathbb P(Z < -2)$, which corresponds to the region only in green. This is $\Phi(-2)$. Thus, the probability in the bounded region is $\Phi(1.5) - \Phi(-2)$.</li>

  <li>The probabilities with strict/nonstrict inequalities are the same here. Because $X$ and $Z$ are continuous random variables, the probability that the variable takes any specific value is zero. So it actually doesn't matter whether we write strict or nonstrict inequalities. Nevertheless, the definition of CDF does not change: it's always $F(x) := \mathbb P(X \leq x)$. For continuous random variables, it happens that $\mathbb P(X \leq x) = \mathbb P(X < x)$.</li>
</ol>

</div>
</details>











### Using the Normal Distribution

None of the theory above tells you whether the normal distribution is a *good* distribution to model your problem in any given scenario. In all of the analysis above, you've already assumed that your random variable, for example $X$, is normally distributed.

We'll discuss more about the assumptions needed to represent an experiment or random process as a normal distribution later on in the course.





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
