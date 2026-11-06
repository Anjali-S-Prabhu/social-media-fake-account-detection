import pytest
from app.schemas import ProfileInput
from app.services.predictor import predictor

def test_predictor_loaded():
    assert predictor.is_loaded() is True
    assert len(predictor.feature_columns) > 0

def test_predict_genuine_profile():
    profile = ProfileInput(
        username="elena_smith",
        accountType="public",
        posts=85,
        followers=1450,
        following=320,
        bio="Digital artist & designer. New art every week! elena-art.com",
        hasProfilePic=True,
        isVerified=False
    )
    result = predictor.predict(profile)
    assert result.username == "elena_smith"
    assert result.prediction == "genuine"
    assert result.riskScore < 50
    assert result.riskLevel in ["low", "medium"]
    assert len(result.flags) > 0

def test_predict_fake_profile():
    profile = ProfileInput(
        username="spambot9081234",
        accountType="private",
        posts=0,
        followers=2,
        following=3500,
        bio="",
        hasProfilePic=False,
        isVerified=False
    )
    result = predictor.predict(profile)
    assert result.username == "spambot9081234"
    assert result.prediction == "fake"
    assert result.riskScore >= 65
    assert result.riskLevel == "high"
    # Check that high risk indicators were generated
    categories = [f.category for f in result.flags]
    assert "Profile Picture" in categories or "Account Activity" in categories or "Followers Ratio" in categories

def test_predict_verified_account_safety():
    profile = ProfileInput(
        username="natgeo",
        accountType="public",
        posts=15000,
        followers=280000000,
        following=150,
        bio="Inspiring people to care about the planet since 1888.",
        hasProfilePic=True,
        isVerified=True
    )
    result = predictor.predict(profile)
    assert result.prediction == "genuine"
    assert result.riskScore < 20
    assert result.riskLevel == "low"
