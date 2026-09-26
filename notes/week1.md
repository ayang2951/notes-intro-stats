<div class="solution-visibility" data-show-solutions="true"></div>

## Basic Introductions

There are three TAs for this course, and each of us is responsible for one recitation section. Attendance is optional, but highly encouraged, and if you have scheduling conflicts, you may attend any of the three recitations. The advent of ChatGPT has made students a lot more careless in truly learning the material&mdash;but you won't have access to technology during your exam... or at least we'll try our best to make sure you don't.

If grades are your only motivator, think of this as extended exam prep. But we hope you stay because the material is interesting.

Your recitation material will be posted here each week. This week is a bit philosophical, but subsequent weeks' material will be very concrete. The problems/examples will be uploaded before recitation begins, but the solutions will be posted only afterward. Please try your best to think the problems through before looking at the solutions.

## Philosophy of Data

We live in a world of data: information of all kinds is stored in all sorts of formats and available to us at a moment's notice. What can we do with it? How do we process it? How do we develop data literacy so that nefarious actors can't play tricks on us?

When we work with data, what can it tell us? What assumptions do we need to make about the data to make it "useful"? How do we use data to communicate with others or better understand the world? What are we interested in as statisticians?

<ol type="i">
  <li>Estimation: if we have data, can we better understand qualities of an entity or group currently mysterious to us?
  
  A simple might be to </li>
  <li>Prediction: if we have data on a subject, can we predict how something will play out?</li>
  <li>Inference: if we have data, can we make convincing statements about the world?</li>
</ol>

Let us begin working with data.

## Descriptive Statistics

Descriptive statistics can be computed from any dataset. The subsequent *interpretation* is what we need to be careful about.

### Mean and Deviation

One of the most important elements of statistics that can often be invisible is the *context*, or the *assumptions* we must make on data.

Suppose that we have been given some numbers: 3, 8, 11, 14. Suppose they represent the ages of 4 children. Without any additional context, can we know whether this is a sample or the entire population? What scenarios can you think of for each?

If I tell you that I randomly selected 4 children in some school district and collected their ages, would they form a sample or a population? If I tell you that I collected the age information of all children in a family, would the data form a sample or a population? It turns out that formulating your object of interest differently can change the nature of the problem too.

A natural first response to being given data is to do some data profiling: in this case, given these four values, we can compute some descriptive statistics.

The *sample mean* and *population mean* are often central objects of interest, even for advanced statistics. Think about your own first response to seeing your exam grade after a midterm. If your grade really matters to you, your first reaction will be to ask, "Well, what was the average grade?"

In this case, the average is nine.

After you learn what the average grade was on the exam, what's your next move? You'll ask how far you were from the average, either above or below.

Everyone can compute their own deviation from the mean. Summing all these differences always gives us zero: intuitively, the average distance from the average is zero.

The next object is slightly mysterious: the squared deviation from the mean. Why should we square that value? If we want to examine how spread out the data is, using only the raw difference values is unhelpful: they always sum to zero. To truly understand how much people "deviate" from the mean, we need to account for people who are above *and* below the average: an easy way of making those values all nonnegative is to square them.

<div class="callout remark">
<div class="label">Remark: Squaring the Deviations</div>

Why don't we take the absolute value? It turns out that squaring gives us a great many nice properties. Most notably, taking a square is a differentiable function, whereas the absolute value is not.

</div>

We now display the table of calculated values.

<table style="border-collapse: collapse;">
  <tr>
    <th style="border: 1px solid black; padding: 6px;">$\textbf{value}$</th>
    <th style="border: 1px solid black; padding: 6px;">$\textbf{value} − \textbf{mean}$</th>
    <th style="border: 1px solid black; padding: 6px;">$(\textbf{deviation from mean})^2$</th>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">3</td>
    <td style="border: 1px solid black; padding: 6px;">−6</td>
    <td style="border: 1px solid black; padding: 6px;">36</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">8</td>
    <td style="border: 1px solid black; padding: 6px;">−1</td>
    <td style="border: 1px solid black; padding: 6px;">1</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">11</td>
    <td style="border: 1px solid black; padding: 6px;">2</td>
    <td style="border: 1px solid black; padding: 6px;">4</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;">14</td>
    <td style="border: 1px solid black; padding: 6px;">5</td>
    <td style="border: 1px solid black; padding: 6px;">25</td>
  </tr>
  <tr>
    <td style="border: 1px solid black; padding: 6px;"><strong>sum:</strong></td>
    <td style="border: 1px solid black; padding: 6px;"><strong>0</strong></td>
    <td style="border: 1px solid black; padding: 6px;"><strong>66</strong></td>
  </tr>
</table>

### Sample vs. Population

For an entire population of $N$ individuals $\{X_1, X_2 \ldots X_N\}$, the population mean and variance are

$$
\mu := \frac{1}{N} \sum_{i = 1}^N X_i, \qquad \sigma^2 := \frac{1}{N} \sum_{i = 1}^N (X_i - \mu)^2.
$$

If we have a sample $\{x_1, x_2 \ldots x_n\}$ of size $n$, the sample mean and variance are

$$
\bar x := \frac{1}{n} \sum_{i = 1}^n x_i, \qquad s^2 := \frac{1}{n - 1} \sum_{i = 1}^n (x_i - \bar x)^2.
$$

Notice that, for the mean, the computation is exactly the same: the only difference is interpretation. However, for the variance, the interpretation directly changes the computation. This is because the mean is involved in the computation: whether we have access to the true $\mu$ or only an estimate $\bar x$ determines whether we normalize by $1/N$ of $1/(n-1)$.

## Using Technology for Data Analysis

There exist a few options for using technology to analyze data. First, the old-school method is to use `R`, open-source software developed for data processing and analysis.

You can 
<a href="https://cran.r-project.org" target="_blank" rel="noopener noreferrer">
download
</a> 
the `R` software for free. I recommend you then 
<a href="https://docs.posit.co/ide/user/#rstudio-ide-oss-downloads" target="_blank" rel="noopener noreferrer">
download
</a>
`RStudio`, which is a nice interface for running R code. Let us know if you have any questions or difficulties.

Running R code is also possible 
<a href="https://rdrr.io/snippets/" target="_blank" rel="noopener noreferrer">
online
</a>: you can copy-paste or write any relevant code and run it. Unfortunately, the limitation is that you cannot upload datasets.

The last option is to directly use GPT or another AI platform. It can be fed files and code and run it for you, as well as generate and correct code. If you have ethical or security qualms about using AI software, I would recommend downloading `R` and `RStudio`. 

You can also use Python, but it's a little less simple for small statistical queries.

### Descriptive Statistics

Let us practice using R to compute descriptive statistics. Here is the R code to define the data:

```R
PTSD <- c(10, 20, 25, 28, 31, 35, 37, 38, 38, 39, 39, 42, 46)

Healthy <- c(23, 39, 40, 41, 43, 47, 51, 58, 63, 66, 67, 69, 72)

```

This defines two variables, `PTSD` and `Healthy`, with their values stored in vectors.

We can then call an R function to compute the relevant descriptive statistics:

```R
cat("PTSD mean:", mean(PTSD), "\n")
cat("PTSD median:", median(PTSD), "\n")
cat("PTSD IQR:", IQR(PTSD), "\n")
print(quantile(PTSD))

cat("\nHealthy mean:", mean(Healthy), "\n")
cat("Healthy median:", median(Healthy), "\n")
cat("Healthy IQR:", IQR(Healthy), "\n")
print(quantile(Healthy))

```

This produces the following output.

<img src="figures/w1-quantiles.png" alt="PTSD vs. Healthy Quantiles" style="display:block; width:40%; max-width:600px; height:auto; margin:1rem auto;">

### Plotting

We can also use the software to plot figures. Using the same data as defined in your `R` environment above, to plot histograms of the two datasets, we can run

```R
hist(Healthy)
hist(PTSD)

```

This produces the following plot.

<img src="figures/w1-ptsd-healthy-histograms.png" alt="PTSD vs. Healthy Histograms" style="display:block; width:90%; max-width:1000px; height:auto; margin:1rem auto;">


We can also plot boxplots for both datasets by running

```R
boxplot(PTSD, Healthy, names = c("PTSD", "Healthy"), horizontal = TRUE)

```

This produces the following plot.

<img src="figures/w1-ptsd-healthy-boxplot.png" alt="PTSD vs. Healthy Boxplots" style="display:block; width:70%; max-width:600px; height:auto; margin:1rem auto;">

### Loading Data from a CSV

Even if you want to do this step using GPT, I would recommend developing *some* degree of familiarity with `R`. Reading GPT output could be useful in the future.

You should store your `R` file and your `.csv` file in the same directory, then set the working directory in `R` to that directory with

```R
working_directory <- rstudioapi::getActiveDocumentContext()$path
setwd(dirname(working_directory))

```

Then load the data with

```R
data <- read.csv("payroll2023.csv")

```

Sometimes, you need to process the data: although the salary values are numeric, they're not stored that way. Some preprocessing is necessary:

```R
salary_data <- as.numeric(gsub("[$,]", "", data$Base.Salary))

```

And we can finally plot the data. We give the plot a title and the x- and y- axes labels. We can also set the number of bars, which controls the granularity.

```R
hist(
  salary_data,
  main = "Histogram of Salaries",
  xlab = "Salary",
  ylab = "Frequency",
  breaks = 20
)

```

<img src="figures/w1-salary-histogram.png" alt="Salary Histograms" style="display:block; width:70%; max-width:600px; height:auto; margin:1rem auto;">

## What Do We Expect Data to Look Like?

Consider two sequences of coin tosses. Which is real?

<img src="figures/w1-coin-tosses.png" alt="Salary Histograms" style="display:block; width:70%; max-width:600px; height:auto; margin:1rem auto;">

<details class="collapsible">
<summary>Answer</summary>
<div class="collapsible__content">

The in-class live demonstration we did was more fun. But the same logic applies here: the first sequence has long strings of $0$s, while the second one does not. 

We can use the longest sequence of $0$s or $1$s, as well as the number of changes between $0$s and $1$s, to guess.

What we learn is that humans are very biased in terms of how we think data *should* look. Rarely does reality match our intuition.

</div>
</details>


<!--


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