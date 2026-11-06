import pytest
from app.schemas import ProfileInput
from app.services.predictor import predictor

def test_extract_features_genuine_profile():
    profile = ProfileInput(
        username="authentic_traveler",
        accountType="public",
        posts=120,
        followers=2500,
        following=450,
        bio="Photographer exploring the world 🌍 Check out my shots!",
        hasProfilePic=True,
        isVerified=False
    )
    df, feat_dict = predictor.extract_features(profile)
    assert len(df) == 1
    assert feat_dict['profile_pic'] == 1
    assert feat_dict['is_private'] == 0
    assert feat_dict['posts_count'] == 120
    assert feat_dict['followers_count'] == 2500
    assert feat_dict['following_count'] == 450
    assert feat_dict['follower_to_following_ratio'] > 5.0
    assert feat_dict['suspicious_follow_imbalance'] == 0
    assert feat_dict['username_digit_ratio'] == 0.0

def test_extract_features_fake_profile():
    profile = ProfileInput(
        username="bot_user987654",
        accountType="private",
        posts=0,
        followers=5,
        following=1800,
        bio="",
        hasProfilePic=False,
        isVerified=False
    )
    df, feat_dict = predictor.extract_features(profile)
    assert feat_dict['profile_pic'] == 0
    assert feat_dict['is_private'] == 1
    assert feat_dict['posts_count'] == 0
    assert feat_dict['followers_count'] == 5
    assert feat_dict['following_count'] == 1800
    assert feat_dict['suspicious_follow_imbalance'] == 1
    assert feat_dict['empty_profile_flag'] == 1
    assert feat_dict['username_digit_ratio'] > 0.4

def test_extract_features_edge_case_zeros():
    profile = ProfileInput(
        username="user",
        posts="",
        followers="",
        following="",
        bio=""
    )
    df, feat_dict = predictor.extract_features(profile)
    assert feat_dict['posts_count'] == 0
    assert feat_dict['followers_count'] == 0
    assert feat_dict['following_count'] == 0
    assert feat_dict['follower_to_following_ratio'] == 0.0
