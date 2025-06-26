const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

// Configura a tua API Gemini aqui
const GEMINI_API_KEY = "AIzaSyB-LziEJHkVSyknn643Tx-W5dEnBF28V-s";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * Função auxiliar para criar timestamp compatível com emulador
 * @return {*} Timestamp
 */
function createTimestamp() {
  return process.env.FUNCTIONS_EMULATOR ?
    new Date() : admin.firestore.FieldValue.serverTimestamp();
}

/**
 * Geração de Relatórios AI com Multi-tenant e Segurança Aprimorada
 */
exports.generateAiReport = functions.https.onCall(async (data, context) => {
  try {
    // 🔐 VALIDAÇÃO DE AUTENTICAÇÃO OBRIGATÓRIA
    if (!context.auth) {
      throw new functions.https.HttpsError(
          "unauthenticated",
          "Utilizador não autenticado. Por favor, faça login.",
      );
    }

    const uid = context.auth.uid;
    const {prompt, reportType = "incident"} = data;

    // Validação de entrada
    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 10) {
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Prompt deve ter pelo menos 10 caracteres.",
      );
    }

    // Obter perfil do utilizador para descobrir a organização
    const userProfile = await db.collection("userProfiles").doc(uid).get();

    if (!userProfile.exists) {
      throw new functions.https.HttpsError(
          "not-found",
          "Perfil de utilizador não encontrado. Complete o onboarding primeiro.",
      );
    }

    const userData = userProfile.data();
    const orgId = userData.organizationId;

    // 🔐 VERIFICAÇÃO DE ACESSO À ORGANIZAÇÃO
    if (!orgId) {
      throw new functions.https.HttpsError(
          "permission-denied",
          "Utilizador não pertence a nenhuma organização.",
      );
    }

    // Verificar se a organização existe e o utilizador tem acesso
    const orgDoc = await db.collection("organizations").doc(orgId).get();
    if (!orgDoc.exists) {
      throw new functions.https.HttpsError(
          "not-found",
          "Organização não encontrada.",
      );
    }

    const orgData = orgDoc.data();
    const currentPlan = (orgData.subscription && orgData.subscription.plan) || "free";

    // 🚨 IMPLEMENTAÇÃO DE LIMITE RIGOROSO PARA PLANO GRATUITO
    if (currentPlan === "free") {
      // Contar relatórios do utilizador atual neste mês
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const userReportsThisMonth = await db.collection("organizations")
          .doc(orgId)
          .collection("reports")
          .where("generatedBy", "==", uid)
          .where("createdAt", ">=", firstDayOfMonth)
          .get();

      if (userReportsThisMonth.size >= 5) {
        throw new functions.https.HttpsError(
            "resource-exhausted",
            "Limite gratuito de 5 relatórios por mês atingido. Faça upgrade para continuar.",
        );
      }
    }

    // Verificar limite de relatórios mensais da organização
    const statsDoc = await db.collection("organizations")
        .doc(orgId).collection("stats").doc("current").get();
    const currentStats = statsDoc.exists ?
      statsDoc.data() : {monthlyReports: 0***REMOVED***

    // Para planos gratuitos, aplicar limite mais restritivo
    const monthlyLimit = currentPlan === "free" ? 5 : ((orgData.settings && orgData.settings.aiReportsLimit) || 50);

    if (currentStats.monthlyReports >= monthlyLimit) {
      throw new functions.https.HttpsError(
          "resource-exhausted",
          `Limite mensal de ${monthlyLimit} relatórios atingido. ` +
          `${currentPlan === "free" ? "Faça upgrade para continuar." : "Entre em contato conosco."}`,
      );
    }

    // Chamada à API Gemini
    const geminiResponse = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [{
                text: `Como especialista em HSE (Health, Safety & Environment), ` +
                    `gera um relatório detalhado sobre: ${prompt}. ` +
                    `Tipo de relatório: ${reportType}. ` +
                    `Formato o relatório em português com seções claras: ` +
                    `Resumo Executivo, Análise, Recomendações e Conclusão.`,
              }],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
    );

    const resultText = geminiResponse.data.candidates[0].content.parts[0].text;

    // Preparar dados do relatório com estrutura HSE
    const reportData = {
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      content: resultText,
      type: reportType,
      generatedBy: uid,
      organizationId: orgId,
      aiGenerated: true,
      category: "safety",
      status: "draft",
      createdAt: createTimestamp(),
      updatedAt: createTimestamp(),
      metadata: {
        promptUsed: prompt,
        aiModel: "gemini-1.5-flash",
        tokens: (geminiResponse.data.usageMetadata &&
          geminiResponse.data.usageMetadata.totalTokenCount) || 0,
      },
    ***REMOVED***

    // Batch write para salvar relatório e atualizar estatísticas
    const batch = db.batch();

    // 1. Salvar relatório
    const reportRef = db.collection("organizations")
        .doc(orgId).collection("reports").doc();
    batch.set(reportRef, reportData);

    // 2. Atualizar estatísticas da organização
    const statsRef = db.collection("organizations")
        .doc(orgId).collection("stats").doc("current");
    batch.set(statsRef, {
      totalReports: (currentStats.totalReports || 0) + 1,
      monthlyReports: (currentStats.monthlyReports || 0) + 1,
      lastResetDate: currentStats.lastResetDate || createTimestamp(),
      updatedAt: createTimestamp(),
    }, {merge: true});

    await batch.commit();

    console.log(`✅ AI Report generated successfully: ${reportRef.id} for org: ${orgId}`);

    return {
      success: true,
      reportId: reportRef.id,
      result: resultText,
      message: "AI Report generated successfully",
      usage: {
        monthlyReports: (currentStats.monthlyReports || 0) + 1,
        limit: orgData.settings.aiReportsLimit,
      },
    ***REMOVED***
  } catch (error) {
    console.error("Error generating AI report:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    if (error.response && error.response.status === 429) {
      throw new functions.https.HttpsError(
          "resource-exhausted",
          "AI service rate limit exceeded. Please try again later.",
      );
    }
    throw new functions.https.HttpsError("internal", "Failed to generate AI report");
  }
});

/**
 * Onboarding do usuário com Segurança Aprimorada
 */
exports.createUserOnboarding = functions.https.onCall(async (data, context) => {
  try {
    // 🔐 VALIDAÇÃO DE AUTENTICAÇÃO OBRIGATÓRIA
    if (!context.auth) {
      throw new functions.https.HttpsError(
          "unauthenticated",
          "Utilizador não autenticado. Por favor, faça login.",
      );
    }

    const uid = context.auth.uid;
    const {email, name} = context.auth.token;
    const {organizationName, organizationType = "startup"} = data;

    // 🔐 VALIDAÇÃO RIGOROSA DE ENTRADA
    if (!organizationName || typeof organizationName !== "string" || organizationName.trim().length < 2) {
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Nome da organização deve ter pelo menos 2 caracteres.",
      );
    }

    const allowedTypes = ["startup", "sme", "enterprise", "ngo", "government"];
    if (!allowedTypes.includes(organizationType)) {
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Tipo de organização inválido.",
      );
    }

    // 🔐 VERIFICAR SE UTILIZADOR JÁ TEM ORGANIZAÇÃO
    const existingUserProfile = await db.collection("userProfiles").doc(uid).get();
    if (existingUserProfile.exists) {
      const userData = existingUserProfile.data();
      if (userData.organizationId) {
        throw new functions.https.HttpsError(
            "already-exists",
            "Utilizador já pertence a uma organização.",
        );
      }
    }

    // Cria ID da organização
    const organizationId = `org_${uid}_${Date.now()}`;

    // Batch write para criar organização e perfil do usuário
    const batch = db.batch();

    // 1. Criar organização
    const orgRef = db.collection("organizations").doc(organizationId);
    batch.set(orgRef, {
      id: organizationId,
      name: organizationName,
      type: organizationType,
      ownerId: uid,
      settings: {
        aiReportsLimit: 50, // Limite mensal de relatórios
        maxUsers: 10,
        maxReports: 100,
        features: ["ai-reports", "dashboard", "analytics"],
      },
      subscription: {
        plan: "starter",
        status: "active",
        expiresAt: null,
      },
      createdAt: createTimestamp(),
      updatedAt: createTimestamp(),
    });

    // 2. Criar perfil do usuário
    const userRef = db.collection("userProfiles").doc(uid);
    batch.set(userRef, {
      id: uid,
      email: email || "",
      displayName: name || (email && email.split("@")[0]) || "User",
      organizationId: organizationId,
      role: "owner", // Owner é admin
      permissions: ["all"],
      isActive: true,
      onboardingCompleted: true,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp(),
    });

    // 3. Criar documento de estatísticas da organização
    const statsRef = db.collection("organizations")
        .doc(organizationId).collection("stats").doc("current");
    batch.set(statsRef, {
      totalReports: 0,
      monthlyReports: 0,
      lastResetDate: createTimestamp(),
      updatedAt: createTimestamp(),
    });

    await batch.commit();

    console.log(`✅ Onboarding completed for user ${uid} with organization ${organizationId}`);

    return {
      success: true,
      organizationId: organizationId,
      message: "Onboarding completed successfully",
    ***REMOVED***
  } catch (error) {
    console.error("Error in createUserOnboarding:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to complete onboarding");
  }
});

/**
 * Obter dados do utilizador e organização com Segurança Aprimorada
 */
exports.getUserData = functions.https.onCall(async (data, context) => {
  try {
    // 🔐 VALIDAÇÃO DE AUTENTICAÇÃO OBRIGATÓRIA
    if (!context.auth) {
      throw new functions.https.HttpsError(
          "unauthenticated",
          "Utilizador não autenticado.",
      );
    }

    const uid = context.auth.uid;

    // 🔐 BUSCAR DADOS APENAS DO UTILIZADOR AUTENTICADO
    const userDoc = await db.collection("userProfiles").doc(uid).get();

    if (!userDoc.exists) {
      // Usuário ainda não fez onboarding
      return {
        success: true,
        user: {
          uid: uid,
          email: context.auth.token.email,
          displayName: context.auth.token.name,
        },
        organization: null,
        needsOnboarding: true,
      ***REMOVED***
    }

    const userData = userDoc.data();
    const orgId = userData.organizationId;

    // 🔐 VERIFICAR SE UTILIZADOR TEM ACESSO À ORGANIZAÇÃO
    if (!orgId) {
      return {
        success: true,
        user: userData,
        organization: null,
        needsOnboarding: true,
      ***REMOVED***
    }

    // Busca dados da organização
    const orgDoc = await db.collection("organizations")
        .doc(userData.organizationId).get();
    const organizationData = orgDoc.exists ? orgDoc.data() : null;

    return {
      success: true,
      user: userData,
      organization: organizationData,
      needsOnboarding: false,
    ***REMOVED***
  } catch (error) {
    console.error("Error in getUserData:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to get user data");
  }
});

/**
 * Obter relatórios da organização
 */
exports.getOrganizationReports = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
          "unauthenticated",
          "User must be authenticated",
      );
    }

    const {uid} = context.auth;
    const {limit = 10, lastDoc = null} = data;

    // Busca dados do usuário para pegar a organização
    const userDoc = await db.collection("userProfiles").doc(uid).get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError("not-found", "User profile not found");
    }

    const userData = userDoc.data();
    const organizationId = userData.organizationId;

    // Query dos relatórios da organização
    let query = db.collection("organizations")
        .doc(organizationId)
        .collection("reports")
        .orderBy("createdAt", "desc")
        .limit(limit);

    if (lastDoc) {
      const lastDocRef = await db.collection("organizations")
          .doc(organizationId)
          .collection("reports")
          .doc(lastDoc)
          .get();

      if (lastDocRef.exists) {
        query = query.startAfter(lastDocRef);
      }
    }

    const reportsSnapshot = await query.get();
    const reports = [];

    reportsSnapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      reports: reports,
      hasMore: reportsSnapshot.size === limit,
    ***REMOVED***
  } catch (error) {
    console.error("Error in getOrganizationReports:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
        "internal",
        "Failed to get organization reports",
    );
  }
});
