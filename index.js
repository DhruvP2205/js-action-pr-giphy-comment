const { Octokit } = require('@octokit/rest');
const Giphy = require('giphy-api');
const core = require('@actions/core');
const github = require('@actions/github');

async function run(){
    try{
        const githubToken = core.getInput('github-token');
        const giphyApiKey = core.getInput('giphy-api-key');

        const octokit = new Octokit({auth:githubToken});
        const giphy = Giphy(giphyApiKey);

        const context = github.context;
        const { owner, repo, number} = context.issue;

        if (!number) {
            core.setFailed("This action can only run on pull_request or issue events.");
            return;
        }

        const prComment = await giphy.random('thank you');

        const gifUrl = 
            prComment?.data?.images?.downsized?.url ||
            prComment?.data?.images?.downsized_large?.url ||
            prComment?.data?.images?.fixed_height?.url ||
            prComment?.data?.images?.original?.url;

        if (!gifUrl) {
            core.setFailed("Failed to fetch a valid GIF URL from Giphy API.");
            return;
        }

        await octokit.issues.createComment({
            owner,
            repo,
            issue_number: number,
            body: `### PR - #${number} \n ### Thank You for this contribution! \n ![Giphy](${gifUrl})`
        });

        core.setOutput('comment-url', `${gifUrl}`);
        console.log("Giphy GIF comment added successfully! Comment URL:", gifUrl);
    } catch(error){
        console.error("Error:", error);
        process.exit(1);
    }
}

run();