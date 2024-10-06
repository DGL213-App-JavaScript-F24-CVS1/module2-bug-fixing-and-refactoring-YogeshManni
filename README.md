[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/iefxxnRK)
# Module 2 - Flood Fill game
Module 2 for DGL 213 Applied JavaScript.

## A continuation of Flood Fill
Since we've taken the time to familiarize ourselves with the Flood Fill codebase we can continue to use it as a foil in module 2 as we learn more about debugging practices, code linting, npm packages and workflows in general.

## Code walkthrough
We won't need quite as in-depth discussion of the code for this module, of course, since you've already spent some time with it. I'll use this section to discuss some of the main changes that I've made in the codebase since module 1: In particular, I've added score tracking and an undo function (your assignment for module 1) and I've added a feature that transposes the board - just for fun.

### Player score
On line 17 I've added a new `const` `playerScoreText` which is used to grab the `span` element with ID `score-text` from the index.html file. We later use the `textContent` property attached to this element reference to update the score value visible to the player.

On line 30 I've added a new constant `MAXIMUM_SCORE`. This is in keeping with my proposed solution from the module 1 milestone 1 document (i.e. the approach to tracking score I have used is to assume a maximum best score of `CELLS_PER_AXIS` squared - the number of cells in the game - and subtract 1 for every click. Thus a 'good' score is closer to, in this case, 81; while a poor score is always closer to 0).

On line 35 I've added a `playerScore` variable. This variable is intended to track the actual player score as calculate with each click.

On line 93 I've added the assignment of `playerScore` to the `playerScoreText` `textContent` property. This line basically just takes whatever is currently stored in `playerScore` converts it to a string and subs it into the HTML element that `playerScoreText` refers to. Note there are no safety checks happening here - we could end up assigning nonsensical information to `playerScoreText.textContent`.

>**innerHTML vs textContent**
>
>The use of the `textContent` property here is done not without consideration. You've probably also seen the `innerHtml` property before. [This short article](https://reactgo.com/innertext-vs-innerhtml/) demonstrates the difference between the `innerHTML` and `innerText` - `innerText` is very similar to `textContent`, at least for our purposes.
>
>One thing to note is that `innerHTML` is a property of the [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML) class, where as `textContent` is a property of [Node](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent). 
>
>The use of `innerHTML` to place text in an HTML page is generally frowned upon since `innerHTML` will accept HTML content that could be used to run malicious scripts on a page. In many cases these days other browser and HTML safety features reduce the chance of this happening; however, it is still a possibility. You should always avoid the use of `innerHTML`.

On line 133 I've added a call to the `updatePlayerScore()` function (see info below) to the `gridClickHandler()`. What this means is that every time a click is registered by the canvas `updatePlayerScore()` will be called. It's worth noting here that this may or may not be an ideal solution: Perhaps we want a scoring model where the score is *only* updated when the play is valid. Here we keep updating score on every click - even on mistakes - *and* we're also not changing the score with an undo. To some extent this all seems 'fair', but it might not be the particular method of scoring you have in mind.

>**Exercise**
>
>You might notice here that the ordering of the functions  `updatePlayerScore()` and `updateGridAt()` is important. If you were to place `updatePlayerScore()` *after* `updateGridAt()` you will notice when you play the game that the score doesn't seem to be updated on the first click on the board, but is updated with every subsequent click. 
>
>Give this a try now and see if you can identify the problem using some experimentation or, better yet, some of the debugging tools from this week's reading.
>
>I'll post a solution in a video late in the first or early in the second week of module 2.

On line 104 I've added the declaration for the `updatePlayerScore()` function. This is a relatively simple function whose only purpose is to modify `playerScore` when called. An intereting thing to note here, however, is the use of the *ternary conditional operator*. This is the only operator in JavaScript (and in most programming languages) that accepts *three* operands rather than one or two (e.g. think about the `+` operator, which has two operands - the two numbers to be added; and the `!` operator, which has one operand - the varible to be negated).

The ternary conditional operator looks like this:
```javascript
<condition> ? <value if true> : <value if false>
```
If the `<condition>` evaluates to true then whatever is in the `<value if true>` section (i.e. the operand *after* the `?` and *before* the `:`) will be returned. On the other hand, if the `<condition>` evalutes to false the `<value if false>` is returned. Typically we would put the whole thing on the right hand side of an expression, that way whatever is returned is assigned to the variable on the left hand side of the expression. Just like so:
```javascript
playerScore = playerScore > 0 ? playerScore -= 1 : 0;
```
In this case the condition checks to see if the value of `playerScore` is greater than 0: if it is greater than 0 then the condition is *true* and we return the *true* operand (i.e. the one between the `?` and the `:`), which simple returns the value of `playerScore` minus 1; if, on the other hand, the value in `playerScore` is currently 0 then the condition evaluates to *false* and the *false* operand is returned (i.e. 0). Whatever the return value is it is stored back into `playerScore`.

So you can probably see from this that the result is that either `playerScore` contains a number 1 or greater, so we subtract 1 from that number and store it in `playerScore`; or `playerScore` is already 0, and we just reassign 0 again.

The ternary conditional operator actually just a shorthand version of a simple `if-else` block. Consider the following:
```javascript
if (playerScore > 0) {
    playerScore -= 1;
} else {
    playerScore = 0
}
```
This is *precisely* the same thing we're doing with the ternary conditional operator - it's just a bit more verbose. So anytime you find yourself writing code like the `if-else` above, consider using the ternary conditional operator instead.

### Undo feature
On line 14 I've added a new `const` `undoButton` that contains a reference to the HTML element that has the ID `undo`. This is our Undo button in the game UI.

On line 142 I've added a new event listener on the `undoButton` to watch for the `mousedown` event. When this event fires we call the function `rollBackHistory()` via `undoLastMove()`.

On line 64 I have added the `rollBackHistory()` function. This function uses a technique similar to that used in `updateGridAt()`: First we check the `grids` array to ensure it has *at least* one element:
```javascript
if (grids.length > 1)
```
(Question: Why at least *1* element? Why not at least *0* elements?)
If `grids` contains at least one element we use the `Array` method `slice()` to create a new version of the `grids` array that contains all but the *last* element in the original `grids` array, which is then directly reassigned to `grids`:
```javascript
grids = grids.slice(0, grids.length-1);
```
Since `grids` now contains all but the most recently created grid we can re-render with the last item in the `grids` array to effectively go back one move to the previous board state.
```javascript
render(grids[grids.length-1]);
```

### Transpose feature
For the transpose feature there was a new `const` reference to the 'Rotate' button and a new associated event listener - much the same as for the undo feature. The most important code to the feature is found on line 71 where the function `transposeGrid()` is defined. I won't walk through the code in detail here, but will leave it as an exercise for you to explore. Note however that we're not just transposing the current grid state, but instead *all* grid states in the `grids` history. Which means that if at some arbitrary point in the game you transpose the grid and then subsequently press undo the game will return transposed versions of all prior grids. This probably doesn't add a lot of value to the game, but it was fun to code :grin:.